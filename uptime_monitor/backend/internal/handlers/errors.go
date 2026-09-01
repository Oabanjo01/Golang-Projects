package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type ErrorResponse struct {
	ResponseMsg         string `json:"responseMsg"`
	ResponseCode        int    `json:"responseCode"`
	ResponseDescription string `json:"responseDescription"`
}

func ErrorHandler(w http.ResponseWriter, errorMessage string, errorCode int) {
	slog.Error("Request failed", "status", errorCode, "message", errorMessage)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(errorCode)

	json.NewEncoder(w).Encode(ErrorResponse{
		ResponseMsg:         errorMessage,
		ResponseCode:        errorCode,
		ResponseDescription: "",
	})
}
