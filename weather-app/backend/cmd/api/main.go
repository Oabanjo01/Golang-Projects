// # Entry point that starts HTTP server
package main

import (
	"fmt"
	"net/http"

	"backend/internal/handlers"
)

func main() {
	// w http.ResponseWriter - This is my response to the browser or client
	// r *http.Request - This is the request from the client
	// http.HandleFunc("GET /hello", func(w http.ResponseWriter, r *http.Request) {
	// 	fmt.Fprintf(w, "Hello, you've requested: %s\n", r.URL.Query().Get("token"))
	// })

	// We forward users request to the fileserver
	// Where we serve the file from back to users
	// this tells us to look for social.png in the assets folder in the frontend directory
	// It then becomes this - ../frontend/assets/social.png
	// fs := http.FileServer(http.Dir("../frontend/assets/"))
	// fmt.Println(fs, "fs:")
	// Registers (points the url) at this file server
	// The request to /assets/ will be forwarded to the file server
	// This beacomes social.png
	// http.Handle("/assets/", http.StripPrefix("/assets/", fs))

	// Now starting the weather API

	http.HandleFunc("GET /api/weather/{city}", handlers.GetWeather)
	http.HandleFunc("GET /api/forecast/{lat}/{lon}", handlers.GetForecast)

	fmt.Println("Server starting on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
