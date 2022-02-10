package server

import (
	"encoding/json"
	"log"
	"net"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

type Socket struct {
	Id         ClientId
	Connection net.Conn
}

func (s *Socket) Listen(messages chan<- *Message, closed chan<- ClientId) {
	go func() {
		defer func() {
			// This call waits until the message is processed
			closed <- ClientId(s.Id)

			s.Connection.Close()
		}()

		for {
			payload, op, readErr := wsutil.ReadClientData(s.Connection)
			if readErr != nil {
				log.Printf("[Error] reading message from %v: %v \n", s.Id, readErr)
				break
			}

			if op != ws.OpText {
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
	var received struct {
		To      ClientId `json:"to"`
		Content string   `json:"content"`
	}

	if err = json.Unmarshal(payload, &received); err != nil {
		message = nil
	} else {
		message = NewMessage(s.Id, received.To, received.Content)
	}

	return
}
