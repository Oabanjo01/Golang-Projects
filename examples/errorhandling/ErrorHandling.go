package main

import "fmt"

// Incase we miss an error on compile time
// In runtime error, unlike JS were its an exception, in Go its a panic.

func divide(a int, b int) int {
	return a / b
}

func deferredFunc() {

	// recover can only be used inside a function that is deferred.
	// Catches any error that occurs, and saves in the r variable
	r := recover()
	fmt.Println("Sigh", r)
	if r == nil {
		fmt.Println(r)
	} else {
		fmt.Println("No error occured")
	}
}

func main() {
	// // defer statement runs no matter what. Like a finally block in JS
	// // Usually runs afterwards
	// defer deferredFunc()

	// divide(5, 0)

	// // panic("This cause a crash") // Panic in Golang
	// fmt.Println("Sigh ==")

	result, err := Divide(5, 0)

	if err == nil {
		fmt.Println(result)
	} else {
		fmt.Println(err)
	}
}
