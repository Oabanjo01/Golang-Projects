package handlers

import (
	"backend/internal/models"
	"backend/internal/storage"
	"database/sql"
	"encoding/json"
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
