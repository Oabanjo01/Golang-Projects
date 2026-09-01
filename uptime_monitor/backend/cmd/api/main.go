package main

import (
	"context"
	"log"
	"net/http"

	"uptime_monitor/internal/config"
	"uptime_monitor/internal/database"
	"uptime_monitor/internal/handlers"
	"uptime_monitor/internal/repository"
	"uptime_monitor/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()
	pool, err := database.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("An error occurred creating a new pool: %s", err)
	}
	defer pool.Close()

	users := repository.NewUserRepository(pool)
	authService := service.NewAuthService(users)
	app := handlers.NewApplication(authService)

	mux := http.NewServeMux()

	mux.HandleFunc("POST /api/auth/register", app.RegisterUser)
	mux.HandleFunc("POST /api/auth/login", app.RegisterUser)

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		log.Println("WHat did this return")
		if err := pool.Ping(r.Context()); err != nil {
			handlers.ErrorHandler(w, "database unreachable", http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	log.Printf("listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
		log.Fatal(err)
	}
}
