package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func displayMenu() {
	fmt.Println("Let's get started, Enter option:")
	fmt.Println("1: Add Task")
	fmt.Println("2: List Tasks")
	fmt.Println("3: Complete Task")
	fmt.Println("4: Exit")
}

func parseInputToInt(input string) (int, error) {
	cleanInput := strings.TrimSpace(input)
	num, err := strconv.Atoi(cleanInput)
	if err != nil {
		// We create a custom error message to pass back
		return 0, fmt.Errorf("could not convert '%s' to a valid number", cleanInput)
	}
	return num, nil
}

func isOutsideValueRange(value int) bool {
	return value < 1 || value > 4
}

func checkScannerShutdown(scanner *bufio.Scanner) {
	if scanner.Err() != nil {
		fmt.Println("Something crashed closing the program.")
	} else {
		fmt.Println("We closed the program properly.")
	}
}

func handleChoice(scanner *bufio.Scanner, usersChoice int) {
	// defaultTask := Task{}
	// defaultTaskList := []Task{}
	switch usersChoice {
	case 1:
		addTask(scanner)
	case 2:
		tasks := fetchTask(scanner)
		fmt.Printf("These are your tasks: %+v\n", tasks)
	case 3:
		updateTask(scanner)
	case 4:
		os.Exit(0)
	default:

	}
}

func parseTextInput(input string) string {
	trimmedString := strings.TrimSpace(input)
	return trimmedString
}
