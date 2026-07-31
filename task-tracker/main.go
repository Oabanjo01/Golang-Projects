package main

import (
	"fmt"
	"os"
)

var nextID = 1
var tasks = []Task{}
var fileName = "tasks.json"

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: task-cli <command> [arguments]")
		return
	}

	command := os.Args[1]

	switch command {
	case "add":
		if len(os.Args) < 3 {
			fmt.Println("Please provide a task description.")
			return
		}
		description := os.Args[2]
		describeTask(description)

	case "load":
		tasks, err := loadTasks()
		if err != nil {
			fmt.Printf("Error loading tasks: %v\n", err)
			return
		}

		if len(tasks) == 0 {
			fmt.Println("No tasks found.")
			return
		}

		fmt.Printf("Loaded %d task(s):\n", len(tasks))
		for _, task := range tasks {
			fmt.Printf("[%s] ID: %d - %s\n", task.Status, task.Id, task.Name)
		}

	case "delete":
		taskToDelete := os.Args[2]

		deleteTask(taskToDelete)

	default:
		fmt.Println("This command does not exist, try task-cli --help")
	}
}

// Using Bufio scanner
// scanner := bufio.NewScanner(os.Stdin)

// for {
// 	displayMenu()

// 	// Something broke, break the loop
// 	if !scanner.Scan() {
// 		break
// 	}

// 	choice := scanner.Text()

// 	formattedChoiceType, err := parseInputToInt(choice)

// 	if err != nil {
// 		fmt.Println("An error occurred converting choice to int")
// 		continue
// 	}

// 	isOutsideRange := isOutsideValueRange(formattedChoiceType)

// 	if isOutsideRange {
// 		fmt.Println("Your value is outside the range needed")
// 		continue
// 	}

// 	// scan() returns true here
// 	handleChoice(scanner, formattedChoiceType)
// }

// checkScannerShutdown(scanner)
