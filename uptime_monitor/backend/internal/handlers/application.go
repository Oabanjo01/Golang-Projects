package handlers

import "uptime_monitor/internal/service"

// Application holds every dependency the handlers need. Handlers are methods
// on it rather than free functions closing over package-level globals — that
// keeps main.go the single place that constructs dependencies, while each
// handler's method signature stays the plain net/http shape the router wants.
type Application struct {
	Auth *service.AuthService
	User *service.AuthService
}

func NewApplication(auth *service.AuthService) *Application {
	return &Application{Auth: auth}
}
