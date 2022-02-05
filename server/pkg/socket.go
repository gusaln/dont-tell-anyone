package server

import (
	"encoding/json"
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
		defer func() {
			// This call waits until the message is processed
			closed <- SocketId(s.Id)

			s.Connection.Close()
		}()

		for {
			msgT, payload, readErr := s.Connection.ReadMessage()
			if readErr != nil {
				log.Printf("[Error] reading message from %v: %v \n", s.Id, readErr)
				break
			}

			if msgT != websocket.TextMessage {
				log.Printf("[Error] Message from %v can't be parsed \n", s.Id)
				continue
			}

			message, parseErr := s.parseMessage(payload)
			if parseErr != nil {
				log.Printf(
					"[Error] Message from %v can't be parsed as a message:\nmessage: %v\nerror: %v\n",
					s.Id,
					string(payload),
					parseErr,
				)
				continue
			}

			messages <- message

		}
	}()
}

func (s *Socket) parseMessage(payload []byte) (message *Message, err error) {
	if err = json.Unmarshal(payload, message); err != nil {
		message = nil
	} else {
		message.From = s.Id
	}

	return
}
