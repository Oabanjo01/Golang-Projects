package main

import "time"

// struct tags - acts as a translator between exported stuct values
//  and JSON convetions

type Task struct {
	Id        int       `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	Completed bool      `json:"completed"`
	UpdatedAt time.Time `json:"updatedAt"`
}
