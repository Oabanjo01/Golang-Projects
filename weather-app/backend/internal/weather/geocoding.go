package weather

import (
	"backend/internal/models"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

func GetCoordinates(city string, apiKey string) (*models.Location, error, int) {
	// We want to build a URL with dynamic values
	url := fmt.Sprintf("https://api.openweathermap.org/geo/1.0/direct?q=%s&limit=1&appid=%s", url.QueryEscape(city), apiKey)

	response, err := http.Get(url)

	if err != nil {
		return nil, err, http.StatusInternalServerError
	}

	// Close the network connection after we are done with it to avoid memory leaks.
	defer response.Body.Close()

	var locations models.LocationResponse

	// json.NewDecoder(response.Body) - Read JSON and convert it into Go values.
	// .Decode(&locations) - Put the decoded JSON into the locations variable.
	// & - Here is the actual memory location."
	err = json.NewDecoder(response.Body).Decode(&locations)
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}

	if len(locations) == 0 {
		return nil, fmt.Errorf("no locations found for city: %s", city), http.StatusNotFound
	}

	return &locations[0], nil, response.StatusCode
}
