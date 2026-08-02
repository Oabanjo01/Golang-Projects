package handlers

import (
	"encoding/json"
	"net/http"
)

type AppError struct {
	Message    string
	StatusCode int
}

// Parses it to a JSON format for the client to understand and sends it back to the client.
func ErrorHandler(w http.ResponseWriter, statusCode int, errorMessage string) {
	w.Header().Set("Content-Type", "application/json")

	// I am done setting up the response headers, send them out over the network now."
	w.WriteHeader(statusCode)

	json.NewEncoder(w).Encode(
		map[string]string{
			"error": errorMessage,
		},
	)
}

func AppErrorHandler(e AppError) string {
	return e.Message
}
