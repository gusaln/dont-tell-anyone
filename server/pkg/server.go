package server

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

const TicketsRepoPath = "./storage/tickets.json"

type Server struct {
	sockets         map[ClientId]*Socket
	ticketService   *TicketService
	inboundMessages chan *Message
	newSockets      chan *Socket
	closedSockets   chan ClientId
}

func NewServer() *Server {
	return &Server{
		sockets:         make(map[ClientId]*Socket),
		ticketService:   NewTicketService(),
		inboundMessages: make(chan *Message),
		newSockets:      make(chan *Socket),
		closedSockets:   make(chan ClientId),
	}
}

func (srv *Server) Run() {
	srv.ticketService.Load(TicketsRepoPath)

	go srv.processMessages()

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.Any("/chat", srv.handleWebsocketConnection())
	router.POST("/ticket", srv.handleTicketRequest())

	httpServer := &http.Server{
		Addr:    ":4242",
		Handler: router,
	}

	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		if err := httpServer.ListenAndServe(); err != nil && errors.Is(err, http.ErrServerClosed) {
			log.Printf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need to add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Persist tickets
	srv.ticketService.Persist(TicketsRepoPath)

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")

}

func (srv *Server) processMessages() {
	// Everything is proccessed by a single goroutine to prevent having to use locks for now.
	for {
		select {
		case msg := <-srv.inboundMessages:
			srv.sendMessage(msg)
		case socket := <-srv.newSockets:
			srv.addSocket(socket)
		case socketId := <-srv.closedSockets:
			srv.removeSocket(socketId)
		}
	}
}

func (srv *Server) sendMessage(msg *Message) {
	log.Printf("Sending message: %v", msg)

	if s, present := srv.sockets[msg.To]; present {
		var err error
		var payload []byte
		if payload, err = json.Marshal(msg); err != nil {
			log.Fatal(err)
		}

		if err = wsutil.WriteServerMessage(s.Connection, ws.OpText, payload); err != nil {
			log.Fatal(err)
		}
	}
}

func (srv *Server) addSocket(socket *Socket) {
	srv.sockets[socket.Id] = socket
	socket.Listen(srv.inboundMessages, srv.closedSockets)
	log.Printf("New socket: %v", socket.Id)
}

func (srv *Server) removeSocket(socketId ClientId) {
	delete(srv.sockets, socketId)
	log.Printf("Socket removed: %v", socketId)
}

func (srv *Server) handleWebsocketConnection() func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		ticketId := ctx.Query("ticket")

		if ticketId == "" {
			ctx.String(http.StatusBadRequest, "Bad request")
			log.Print("Client did not provide a ticket")
			return
		}

		ticket, present := srv.ticketService.Get(TicketId(ticketId))
		if !present {
			ctx.String(http.StatusBadRequest, "Bad request")
			log.Print("Client did not provide a ticket")
			return
		}

		conn, _, _, err := ws.UpgradeHTTP(ctx.Request, ctx.Writer)
		if err != nil {
			ctx.String(http.StatusBadRequest, "Bad request")
			log.Print("Upgrade failed:", err)
			return
		}

		socket := &Socket{Id: ticket.ClientId, Connection: conn}

		// This call waits until the message is processed
		srv.newSockets <- socket
	}
}

func (srv *Server) handleTicketRequest() func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		id := ctx.PostForm("id")

		if id == "" {
			ctx.String(http.StatusBadRequest, "Bad request")
			log.Print("Client did not provide an Id")
			return
		}

		ticket := NewTicket(ClientId(id))
		srv.ticketService.Store(ticket)

		ctx.JSON(200, gin.H{"ticket": ticket})
	}
}
