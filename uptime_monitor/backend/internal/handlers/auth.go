package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"uptime_monitor/internal/models"
	"uptime_monitor/internal/service"
)

// RegisterUser parses the request and calls app.Auth.Register. It must never
// contain SQL or password-hashing logic itself — that belongs in the service
// and repository layers respectively. This is a method on *Application (not a
// free function) because it needs app.Auth to do anything.
//
// TODO: decode {email, password} from the body, call app.Auth.Register,
// write the created user as JSON on success, handlers.ErrorHandler on failure.
func (app *Application) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var request models.RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&request)

	if err != nil {
		ErrorHandler(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if request.Email == "" || request.Password == "" {
		ErrorHandler(w, "email and password are required", http.StatusBadRequest)
		return
	}

	user, registerErr := app.Auth.Register(r.Context(), request.Email, request.Password)

	if errors.Is(registerErr, service.ErrDuplicateEmail) {
		ErrorHandler(w, "email already exists", http.StatusConflict)
		return
	}

	if registerErr != nil {
		ErrorHandler(w, "An issue occurred registering user", http.StatusBadRequest)
		return
	}
	log.Println("Created")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}
