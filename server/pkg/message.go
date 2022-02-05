package server

type Message struct {
	From    SocketId `json:"from,omitempty"`
	To      SocketId `json:"to"`
	Content string   `json:"content"`
}

func NewMessage(from, to SocketId, content string) *Message {
	return &Message{From: from, To: to, Content: content}
}
