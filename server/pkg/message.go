package server

type Message struct {
	Content string
}

func NewMessage(content string) *Message {
	return &Message{Content: content}
}
