package storage

import (
	"backend/internal/models"
	"database/sql"
	"errors"
	"fmt"
)

func AddLocation(db *sql.DB, clientRequest *models.LocationRequest) error {
	query := fmt.Sprintf(`
	INSERT INTO %s (name, lat, lon, country) VALUES (?, ?, ?, ?)
	`, Saved_locations_table)

	_, err := db.Exec(query, clientRequest.Name, clientRequest.Lat, clientRequest.Lon, clientRequest.Country)

	return err
}

func ListLocations(db *sql.DB) ([]models.SavedLocation, error) {
	query := fmt.Sprintf(`
	SELECT id, name, lat, lon, country FROM %s
	`, Saved_locations_table)

	rows, err := db.Query(query)

	if err != nil {
		return []models.SavedLocation{}, err
	}

	defer rows.Close()

	var locations models.SavedLocationResponse = models.SavedLocationResponse{}

	for rows.Next() {
		var loc models.SavedLocation

		err := rows.Scan(&loc.ID, &loc.Name, &loc.Lat, &loc.Lon, &loc.Country)

		if err != nil {
			return nil, err
		}

		locations = append(locations, loc)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return locations, err
}

var ErrorNotFound = errors.New("Could not find location")

func DeleteLocation(db *sql.DB, id string) error {

	// Parameterized query (?), Go passes id strictly as literal text.
	query := fmt.Sprintf("DELETE FROM %s WHERE id = ?;", Saved_locations_table)

	res, err := db.Exec(query, id)

	if err != nil {
		return err
	}

	rowsAffected, err2 := res.RowsAffected()

	if err2 != nil {
		return err2
	}

	if rowsAffected == 0 {
		return ErrorNotFound
	}

	return nil
}
