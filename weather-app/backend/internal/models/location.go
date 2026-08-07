package models

type Location struct {
	Name       string            `json:"name"`
	LocalNames map[string]string `json:"local_names"`
	Lat        float64           `json:"lat"`
	Lon        float64           `json:"lon"`
	Country    string            `json:"country"`
}

type LocationRequest struct {
	Name      string  `json:"name"`
	Lat       float64 `json:"lat"`
	Lon       float64 `json:"lon"`
	Country   string  `json:"country"`
	CreatedAt string  `json:"created_at"`
}

type LocationResponse []Location
