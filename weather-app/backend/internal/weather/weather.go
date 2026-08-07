package weather

import (
	"encoding/json"
	"fmt"
	"net/http"

	"backend/internal/models"
)

// GetWeather returns current weather for a city
// @Summary Get current weather
// @Tags weather
// @Produce json
// @Param city path string true "City name"
// @Success 200 {object} models.WeatherResponse
// @Failure 400 {object} map[string]string "city is required"
// @Failure 404 {object} map[string]string "city not found"
// @Failure 500 {object} map[string]string "upstream or server error"
// @Router /api/weather/{city} [get]
func GetWeather(lat string, lon string, apiKey string) (*models.WeatherResponse, error, int) {
	url := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s&units=metric", lat, lon, apiKey)

	weatherResponse, err := http.Get(url)
	if err != nil {
		fmt.Println("Error fetching weather data:", err)
		return nil, err, http.StatusInternalServerError
	}
	defer weatherResponse.Body.Close()

	var weatherData models.WeatherResponse

	err = json.NewDecoder(weatherResponse.Body).Decode(&weatherData)
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}

	return &weatherData, nil, weatherResponse.StatusCode
}

// GetForecast returns a 5-day/3-hour forecast for coordinates
// @Summary Get weather forecast
// @Tags weather
// @Produce json
// @Param lat path string true "Latitude"
// @Param lon path string true "Longitude"
// @Success 200 {object} models.ForecastResponse
// @Failure 400 {object} map[string]string "lat/lon is required"
// @Failure 500 {object} map[string]string "upstream or server error"
// @Router /api/forecast/{lat}/{lon} [get]
func GetForecast(lat string, lon string, apiKey string) (*models.ForecastResponse, error, int) {
	url := fmt.Sprintf("https://api.openweathermap.org/data/2.5/forecast?lat=%s&lon=%s&appid=%s&units=metric", lat, lon, apiKey)

	forecastResponse, err := http.Get(url)
	if err != nil {
		fmt.Println("Error fetching forecast data:", err)
		return nil, err, http.StatusInternalServerError
	}
	defer forecastResponse.Body.Close()

	var forecastData models.ForecastResponse

	err = json.NewDecoder(forecastResponse.Body).Decode(&forecastData)
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}

	return &forecastData, nil, forecastResponse.StatusCode
}
