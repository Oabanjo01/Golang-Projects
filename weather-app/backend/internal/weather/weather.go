package weather

import (
	"encoding/json"
	"fmt"
	"net/http"

	"backend/internal/models"
)

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
