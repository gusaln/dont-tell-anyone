package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Server struct {
	Sockets         map[SocketId]*Socket
	inboundMessages chan *Message
	newSockets      chan *Socket
	closedSockets   chan SocketId
	lastSocketId    SocketId
}

func NewServer() *Server {
	return &Server{
		Sockets:         make(map[SocketId]*Socket),
		inboundMessages: make(chan *Message),
		newSockets:      make(chan *Socket),
		closedSockets:   make(chan SocketId),
		lastSocketId:    0,
	}
}

func (srv *Server) Run() {
	go srv.processMessages()

	var upgrader = websocket.Upgrader{} // use default options
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("upgrade failed:", err)
			return
		}

		id := srv.lastSocketId + 1
		srv.lastSocketId = id

		socket := &Socket{Id: id, Connection: conn}

		// This call waits until the message is processed
		srv.newSockets <- socket
	})
	log.Println("Opening on port 4242")
	log.Fatal(http.ListenAndServe(":4242", nil))
}

func (srv *Server) broadcast(msg *Message) {
	log.Printf("broadcasting message: %v", msg)

	for _, s := range srv.Sockets {
		err := s.Connection.WriteMessage(websocket.BinaryMessage, []byte(msg.Content))
		if err != nil {
			log.Fatal(err)
		}
	}
}

func (srv *Server) processMessages() {
	for {
		select {
		case msg := <-srv.inboundMessages:
			srv.broadcast(msg)
		case socket := <-srv.newSockets:
			srv.addSocket(socket)
		case socketId := <-srv.closedSockets:
			srv.removeSocket(socketId)
		}
	}
}

func (srv *Server) addSocket(socket *Socket) {
	srv.Sockets[socket.Id] = socket
	socket.Listen(srv.inboundMessages, srv.closedSockets)
	log.Printf("new socket: %v", *socket)
}

func (srv *Server) removeSocket(socketId SocketId) {
	delete(srv.Sockets, socketId)
	log.Print("socket removed:", socketId)
}
