package server

import (
	"log"

	"github.com/gorilla/websocket"
)

type SocketId uint32

type Socket struct {
	Id         SocketId
	Connection *websocket.Conn
}

func (s *Socket) Listen(messages chan<- *Message, closed chan<- SocketId) {
	go func() {
		for {
			_, message, err := s.Connection.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				break
			}

			messages <- NewMessage(string(message))
		}

		// This call waits until the message is processed
		closed <- SocketId(s.Id)

		s.Connection.Close()
	}()
}
