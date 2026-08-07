package storage

import (
	"backend/internal/models"
	"database/sql"
	"fmt"
)

func AddLocation(db *sql.DB, clientRequest *models.LocationRequest) error {
	query := fmt.Sprintf(`
	INSERT INTO %s (name, lat, lon, country) VALUES (?, ?, ?, ?)
	`, Saved_locations_table)

	_, err := db.Exec(query, clientRequest.Name, clientRequest.Lat, clientRequest.Lon, clientRequest.Country)

	return err
}

// func ListLocations(db *sql.DB) ([]models.Location, error) {

// }

// func DeleteLocation(db *sql.DB, id int) error {

// }
