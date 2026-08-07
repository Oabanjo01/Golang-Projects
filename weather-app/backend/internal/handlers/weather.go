package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"backend/internal/weather"
)

func GetWeather(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("OPEN_WEATHER_API_KEY")

	city := r.PathValue("city")

	if city == "" {
		ErrorHandler(w, http.StatusBadRequest, "City is required")
		return
	}

	locationData, err, statusCode := weather.GetCoordinates(city, apiKey)
	fmt.Println("locationData:", locationData)
	if err != nil {
		ErrorHandler(w, statusCode, fmt.Sprintf("Could not get coordinates for city %s: %v", city, err))
		return
	}

	weatherData, err, statusCode := weather.GetWeather(fmt.Sprintf("%f", locationData.Lat), fmt.Sprintf("%f", locationData.Lon), apiKey)
	if err != nil {
		ErrorHandler(w, statusCode, fmt.Sprintf("Could not get weather data for city %s: %v", city, err))
		return
	}

	for i := range weatherData.Weather {
		weatherData.Weather[i].IconURL = fmt.Sprintf("https://openweathermap.org/img/wn/%s@2x.png", weatherData.Weather[i].Icon)
	}
	w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w) means Encode JSON directly into the HTTP response.
	json.NewEncoder(w).Encode(weatherData)

}

func GetForecast(w http.ResponseWriter, r *http.Request) {
	apiKey := os.Getenv("OPEN_WEATHER_API_KEY")

	lat := r.PathValue("lat")
	if lat == "" {
		ErrorHandler(w, http.StatusBadRequest, "Latitude is required")
		return
	}

	lon := r.PathValue("lon")
	if lon == "" {
		ErrorHandler(w, http.StatusBadRequest, "Longitude is required")
		return
	}

	w.Header().Set("Content-Type", "application/json")

	forecastData, err, statusCode := weather.GetForecast(lat, lon, apiKey)
	if err != nil {
		ErrorHandler(w, statusCode, fmt.Sprintf("Could not get forecast data for coordinates (%s, %s): %v", lat, lon, err))
		return
	}
	json.NewEncoder(w).Encode(forecastData)
}
