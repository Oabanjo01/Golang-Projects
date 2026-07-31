package main

import (
	"fmt"
)

func main() {
	// y := 3       // implicit defined
	// b := uint(4) // type cast

	// var a int = 10 // Explicitly defined

	str := "hello World"

	for _, char := range str {
		// fmt.Println(i, string(char))
		fmt.Printf("%c", char)
	}
	fmt.Println()
}
