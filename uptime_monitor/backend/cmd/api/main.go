package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {

	mux := http.NewServeMux()

	dbURL := os.Getenv("DATABASE_URL")

	fmt.Println("dbURL:", dbURL)

	err := http.ListenAndServe(":8080", mux)

	if err != nil {
		fmt.Println("Hello")
		log.Fatal(err)
	}
}
