package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func statement(tipInFloat float64) string {
	switch {
	case tipInFloat < 10:
		return "Don't be stingy"
	default:
		return "Great, thanks for the tip"
	}
}

func readUserInput(prompt string) string {
	fmt.Print(prompt)
	reader := bufio.NewReader(os.Stdin)

	userInput, err := reader.ReadString('\n')

	if err != nil {
		fmt.Println("We ran into an error with your input")
		return ""
	}

	return strings.TrimSpace(userInput)
}

func readUsersBool(prompt string) bool {
	boolChoice := readUserInput(prompt)

	parsedBoolChoice, err2 := strconv.ParseBool(boolChoice)

	if err2 != nil {
		fmt.Println("We ran into an error parsing your input")
		return true
	}

	return parsedBoolChoice
}

func readUserFloat(prompt string) (float64, error) {
	floatChoice := readUserInput(prompt)

	parsedFloat, err := strconv.ParseFloat(strings.TrimSpace(floatChoice), 64)

	if err != nil {
		fmt.Println("An error occured with your input, only numbers please")
		return 0, err
	}
	return parsedFloat, nil
}

func main() {
	var billTotal float64

	fmt.Print("Enter the total bill: ")
	// Scan stops at white spaces.
	fmt.Scan(&billTotal)
	fmt.Println("The bill total is: ", billTotal)

	// Doesn't stop at white spaces
	tipInFloat, err := readUserFloat("Let the customer enter tip percent: ")
	if err != nil {
		fmt.Println("Error reading tip percentage")
		return
	}

	waiterResponse := statement(tipInFloat)

	fmt.Println("Waiters response:", waiterResponse)

	if waiterResponse == "Don't be stingy" {
		return
	} else {
		multipleUsers := readUsersBool("Will payment be split? (true/false): ")

		if multipleUsers {
			numberOfPeople, err := readUserFloat("How many indiviuals does this bill belong to? ")
			if err != nil {
				fmt.Println("Error reading number of people")
				return
			}
			newTotalAmountPerPerson := (billTotal + (billTotal * tipInFloat / 100)) / numberOfPeople
			fmt.Println("The total amount per person is: ", newTotalAmountPerPerson)
		} else {
			newTotalAmountPerPerson := billTotal + (billTotal * tipInFloat / 100)
			fmt.Println("The total amount is: ", newTotalAmountPerPerson)
		}
	}

}
