package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"
)

func describeTask(description string) {
	if description == "" {
		fmt.Println("You cannot have an empty task")
		return
	}

	tasks, err := loadTasks()

	if err != nil {
		fmt.Println("Error loading tasks: err")
		return
	}

	nextID = 1

	if len(tasks) > 0 {
		nextID = tasks[len(tasks)-1].Id + 1
	}

	now := time.Now()

	task := Task{
		Id:        nextID,
		Name:      description,
		Status:    "todo",
		Completed: false,
		UpdatedAt: now,
	}

	tasks = append(tasks, task)

	err = saveTaks(tasks)

	if err != nil {
		fmt.Println("Error saving tasks")
	}
}

func loadTasks() ([]Task, error) {
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		return []Task{}, nil
	}

	data, err := os.ReadFile(fileName)

	if err != nil {
		return nil, err
	}

	var tasks []Task
	err = json.Unmarshal(data, &tasks)

	if err != nil {

		return nil, err
	}
	return tasks, nil
}

func saveTaks(taskList []Task) error {
	val, err := json.MarshalIndent(taskList, "", "  ")

	if err != nil {
		fmt.Print("Cannot save your tasks: err")
	}

	return os.WriteFile(fileName, val, 0644)
}

func deleteTask(taskToDelete string) {
	tasks, err := loadTasks()
	if err != nil {
		fmt.Println("Error loading tasks:", err)
		return
	}

	foundIndex := -1
	for i, task := range tasks {
		fmt.Println(i, task, "blah-blah")
		if strings.EqualFold(task.Name, taskToDelete) {
			foundIndex = task.Id
			break
		}
	}

	fmt.Println(foundIndex, "foundIndex")

	if foundIndex == -1 {
		fmt.Println("Task not found:", taskToDelete)
		return
	}

	tasks = append(tasks[:foundIndex], tasks[foundIndex+1:]...)

	err = saveTaks(tasks)
	if err != nil {
		fmt.Println("Error saving tasks:", err)
		return
	}

	fmt.Println("Task deleted successfully.")
}
