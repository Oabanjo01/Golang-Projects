// # Entry point that starts HTTP server
package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"

	_ "backend/docs"

	_ "modernc.org/sqlite" // _ "modernc.org/sqlite", registers SQLite as the specific driver for that generic interface

	"backend/internal/handlers"
	"backend/internal/loggers"
	"backend/internal/storage"

	httpSwagger "github.com/swaggo/http-swagger"
)

// func main() {
// 	db, _ := sql.Open("sqlite", "weather.db")
// 	defer db.Close()

// 	if err := db.Ping(); err != nil {
// 		log.Fatal("Error connecting to database:", err)
// 		return
// 	}

// 	if err := storage.CreateTable(db); err != nil {
// 		log.Fatal("Error creating tables:", err)
// 		return
// 	}

// 	manuallyInsertQuery := `
// 	INSERT INTO saved_locations (name, lat, lon, country) VALUES (?, ?, ?, ?);
// 	`

// 	_, err := db.Exec(manuallyInsertQuery, "Lagos", 6.5244, 3.3792, "NG", "Lagos")

// 	if err != nil {
// 		log.Fatal("Error inserting data into database:", err)
// 		return
// 	}

// 	var name string
// 	var country string

// 	err = db.QueryRow("SELECT name, country FROM saved_locations WHERE name = ?", "Lagos").Scan(&name, &country)
// 	if err != nil {
// 		log.Fatal("Error querying data from database:", err)
// 		return
// 	}

// 	fmt.Printf("Retrieved data: Name: %s, Country: %s\n", name, country)

// }

// @title Waether App Api
// @version 1.0
// @description Weather * saved-locations API
// @host localhost:8080
// @BasePath /

func main() {

	db, err := sql.Open("sqlite", "weather.db")
	logfile, logerr := os.OpenFile("app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)

	if logerr != nil {
		log.Fatal("Error opening log file:", err)
	}
	logger := slog.New(slog.NewJSONHandler(io.MultiWriter(os.Stdout, logfile), nil))
	slog.SetDefault(logger)

	if err != nil {
		log.Fatal("Error connecting to database:", err)
		return
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Error connecting to database:", err)
		return
	}

	if err := storage.CreateTable(db); err != nil {
		log.Fatal("Error creating tables:", err)
		return
	}

	fmt.Println("Connected to DB successfully")

	defer logfile.Close()
	defer db.Close()
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

	http.Handle("/swagger/", httpSwagger.WrapHandler)
	http.HandleFunc("GET /api/weather/{city}", handlers.GetWeather)
	http.HandleFunc("GET /api/forecast/{lat}/{lon}", handlers.GetForecast)
	http.HandleFunc("POST /api/locations", func(w http.ResponseWriter, r *http.Request) {
		handlers.AddLocation(db, w, r)
	})

	fmt.Println("Server starting on http://localhost:8080")
	http.ListenAndServe(":8080", loggers.WithLogging(http.DefaultServeMux))
}
