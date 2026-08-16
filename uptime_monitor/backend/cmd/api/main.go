package main

import (
	"context"
	"log"
	"net/http"
	"uptime_monitor/internal/database"
)

func main() {

	mux := http.NewServeMux()

	conn, dbErr := database.NewPool(context.Background())

	if dbErr != nil {
		log.Fatalf("An error occurred creating a new pool %s", dbErr)
	}

	defer conn.Close()

	err := http.ListenAndServe(":8080", mux)

	if err != nil {
		log.Fatal(err)
	}
}
