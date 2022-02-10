package server

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

type Server struct {
	sockets         map[ClientId]*Socket
	inboundMessages chan *Message
	newSockets      chan *Socket
	closedSockets   chan ClientId
}

func NewServer() *Server {
	return &Server{
		sockets:         make(map[ClientId]*Socket),
		inboundMessages: make(chan *Message),
		newSockets:      make(chan *Socket),
		closedSockets:   make(chan ClientId),
	}
}

func (srv *Server) Run() {
	go srv.processMessages()

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.Any("/chat", srv.handleWebsocketConnection())
	log.Fatal(router.Run(":4242"))

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
		id := ctx.Query("ticket")

		if id == "" {
			ctx.String(http.StatusBadRequest, "Bad request")
			log.Print("Client did not provide an address")
			return
		}

		conn, _, _, err := ws.UpgradeHTTP(ctx.Copy().Request, ctx.Copy().Writer)
		if err != nil {
			ctx.String(http.StatusBadRequest, "Bad request")
			log.Print("Upgrade failed:", err)
			return
		}

		socket := &Socket{Id: ClientId(id), Connection: conn}

		// This call waits until the message is processed
		srv.newSockets <- socket
	}
}
