package server

import (
	"encoding/json"
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

	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	} // use default options
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Print("Upgrade failed:", err)
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

func (srv *Server) processMessages() {
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

	if s, present := srv.Sockets[msg.To]; present {
		var err error
		var payload []byte
		if payload, err = json.Marshal(msg); err != nil {
			log.Fatal(err)
		}

		if err = s.Connection.WriteMessage(websocket.TextMessage, payload); err != nil {
			log.Fatal(err)
		}
	}
}

func (srv *Server) addSocket(socket *Socket) {
	srv.Sockets[socket.Id] = socket
	socket.Listen(srv.inboundMessages, srv.closedSockets)
	log.Printf("New socket: %v", socket.Id)
}

func (srv *Server) removeSocket(socketId SocketId) {
	delete(srv.Sockets, socketId)
	log.Printf("Socket removed: %v", socketId)
}
