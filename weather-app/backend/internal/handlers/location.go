package handlers

import (
	"backend/internal/models"
	"backend/internal/storage"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

// AddLocation saves a new favorite location
// @Summary Save a location
// @Tags locations
// @Accept json
// @Produce json
// @Param location body models.LocationRequest true "Location to save"
// @Success 202
// @Failure 400 {object} map[string]string
// @Router /api/locations [post]
func AddLocation(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	var clientRequest models.LocationRequest
	// We decode to JSON incoming
	err := json.NewDecoder(r.Body).Decode(&clientRequest)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		ErrorHandler(w, http.StatusBadRequest, "Could not process your request")
		return
	}

	if clientRequest.Name == "" || clientRequest.Country == "" {
		ErrorHandler(w, http.StatusBadRequest, "Could not process your request")
		return
	}

	err = storage.AddLocation(db, &clientRequest)

	if err != nil {
		ErrorHandler(w, http.StatusInternalServerError, "Could not populate")
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// GetSavedLocations fetches all saved locations
// @Summary Fetch all locations
// @Tags locations
// @Accept json
// @Produce json
// @Success 200 {array} models.Location
// @Failure 500 {object} map[string]string
// @Router /api/locations [get]
func GetSavedLocations(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	locations, err := storage.ListLocations(db)

	if err != nil {
		fmt.Println(err)
		ErrorHandler(w, http.StatusInternalServerError, "An error occurred fetching locations")
		return
	}

	json.NewEncoder(w).Encode(locations) // check
}

func RemoveLocation(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Content-Type", "application/json")

		id := r.PathValue("id")

		if id == "" {
			ErrorHandler(w, http.StatusInternalServerError, "An error occurred fetching locations")
			return
		}

		err := storage.DeleteLocation(db, id)

		if errors.Is(err, storage.ErrorNotFound) {
			ErrorHandler(w, http.StatusNotFound, "Failed to delete location")
			return
		}

		if err != nil {
			ErrorHandler(w, http.StatusInternalServerError, "Failed to delete location")
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
