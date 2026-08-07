package storage

import (
	"database/sql"
	"fmt"
)

const Saved_locations_table string = "saved_locations"

// scalar types like strings, numbers, and booleans can use const.
// composite types (such as maps, slices, or structs) cannot

func CreateTable(db *sql.DB) error {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS %s (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		lat REAL NOT NULL,
		lon REAL NOT NULL,
		country TEXT NOT NULL,
		createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`, Saved_locations_table)

	_, err := db.Exec(query)
	fmt.Println("Table created successfully")
	return err
}
