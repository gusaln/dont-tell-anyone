package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

type TicketId string

// ToDo: add ttl
type Ticket struct {
	Id       TicketId `json:"id"`
	ClientId ClientId `json:"client_id"`
}

func NewTicket(clientId ClientId) *Ticket {
	id, _ := NewId()

	return &Ticket{
		Id:       TicketId(id),
		ClientId: clientId,
	}
}

type TicketService struct {
	tickets map[TicketId]*Ticket
}

func NewTicketService() *TicketService {
	return &TicketService{
		tickets: make(map[TicketId]*Ticket),
	}
}

func (tr *TicketService) Get(ticketId TicketId) (*Ticket, bool) {
	if ticket, present := tr.tickets[ticketId]; present {
		return ticket, true
	}

	return nil, false
}

func (tr *TicketService) Store(ticket *Ticket) {
	tr.tickets[ticket.Id] = ticket
}

func (tr *TicketService) Remove(ticket *Ticket) {
	delete(tr.tickets, ticket.Id)
}

func (tr *TicketService) Persist(path string) error {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0644)
	if err != nil {
		log.Println("Error opening file: ", path, err)
		return fmt.Errorf("error opening file %s: %s", path, err.Error())
	}
	defer f.Close()

	buff, errMarshal := json.Marshal(tr.tickets)
	if errMarshal != nil {
		log.Println("Error marshaling data: ", errMarshal)
		return fmt.Errorf("error marshaling data: %s", errMarshal)
	}

	_, errWriting := f.Write(buff)
	if errWriting != nil {
		log.Println("Error writing to file ", path, errWriting)
		return fmt.Errorf("error writing to file %s: %s", path, errWriting)
	}

	return nil
}

func (tr *TicketService) Load(path string) error {
	buff, err := ioutil.ReadFile(path)
	if err != nil {
		log.Println("Error opening file: ", path, err)
		return fmt.Errorf("error opening file %s: %s", path, err.Error())
	}

	if errMarshal := json.Unmarshal(buff, &tr.tickets); errMarshal != nil {
		log.Println("Error unmarshaling data: ", errMarshal)
		return fmt.Errorf("error unmarshaling data: %s", errMarshal)
	}

	return nil
}
