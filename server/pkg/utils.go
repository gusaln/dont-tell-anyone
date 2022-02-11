package server

import (
	"crypto/rand"
	"encoding/hex"
)

func NewId() (string, error) {
	var err error

	buff := make([]byte, 8)
	_, err = rand.Read(buff)

	if err != nil {
		return "", err
	}

	return hex.EncodeToString(buff), nil
}
