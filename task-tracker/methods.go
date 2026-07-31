package main

import (
	"bufio"
	"fmt"
	"strings"
)

func addTask(scanner *bufio.Scanner) (Task, []Task, bool) {
	fmt.Println("Enter a Task name: ")
	if !scanner.Scan() {
		return Task{}, tasks, false
	}

	name := scanner.Text()
	fmt.Println("Current task: ", name)

	formattedInput := parseTextInput(name)

	newTask := Task{Id: nextID, Name: formattedInput, Completed: false}

	tasks = append(tasks, newTask)
	nextID++

	return newTask, tasks, true
}

func fetchTask(scanner *bufio.Scanner) Task {
	fmt.Println("Insert a name for your task: ")

	if !scanner.Scan() {
		return Task{}
	}

	userInput := parseTextInput(strings.ToLower(scanner.Text()))

	for _, task := range tasks {
		if strings.Contains(userInput, task.Name) {
			fmt.Printf("🎯 Match Found! ID: %d, Name: %s\n", task.Id, task.Name)
			return task
		}
	}

	fmt.Println("No matching tasks found.")
	return Task{}
}

func fetchTasks() []Task {
	fmt.Printf("Fetch all the tasks: %d\n", len(tasks))
	return tasks
}

func delete(scanner *bufio.Scanner) {
	task := fetchTask(scanner)

	if task.Id == 0 {
		return
	}
	indexToDelete := -1
	for i, val := range tasks {
		if val.Id == task.Id {
			indexToDelete = i
			break
		}
	}

	if task.Id != -1 {
		tasks = append(tasks[:indexToDelete], tasks[indexToDelete+1:]...)
		fmt.Printf("Success: Task '%s' has been deleted.\n", task.Name)
	}

}

func updateTask(scanner *bufio.Scanner) {
	fmt.Println("What task do you want to update (Enter name keyword): ")

	if !scanner.Scan() {
		return
	}

	lowercaseValueToUpdate := strings.ToLower(scanner.Text())

	filteredResults := []Task{}
	for _, val := range tasks {
		if strings.Contains(strings.ToLower(val.Name), lowercaseValueToUpdate) {
			filteredResults = append(filteredResults, val)
		} else {
			fmt.Println("We couldn't find this task")
		}
	}

	if len(filteredResults) == 0 {
		fmt.Println("There are no tasks to update")
		return
	}

	var targetID int

	if len(filteredResults) > 1 {
		validIds := make(map[int]bool)
		fmt.Println("\nWe found multiple similar tasks. Kindly select one:")

		for _, val := range filteredResults {
			validIds[val.Id] = true
			fmt.Printf("%d: %s\n", val.Id, val.Name)
		}

		fmt.Print("Enter the ID number to choose: ")
		if !scanner.Scan() {
			return
		}

		choice, err := parseInputToInt(scanner.Text())
		_, exists := validIds[choice]
		if err != nil || !exists {
			fmt.Println("Invalid ID selection.")
			return
		}
		targetID = choice
	} else {
		targetID = filteredResults[0].Id
		fmt.Printf("Selected matching task: %s\n", filteredResults[0].Name)
	}

	fmt.Print("Enter the new task name: ")
	if !scanner.Scan() {
		return
	}
	newName := parseTextInput(scanner.Text())

	for i := 0; i < len(tasks); i++ {
		if tasks[i].Id == targetID {
			tasks[i].Name = newName
			fmt.Println("Success: Task updated successfully!")
			return
		}
	}
}
