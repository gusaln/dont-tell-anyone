package server

type Message struct {
	From    ClientId `json:"from,omitempty"`
	To      ClientId `json:"to"`
	Content string   `json:"content"`
}

func NewMessage(from, to ClientId, content string) *Message {
	return &Message{From: from, To: to, Content: content}
}
