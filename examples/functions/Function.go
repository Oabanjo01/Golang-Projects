package main

import "fmt"

func callableFuction(callable func(int) int) int {
	return callable(5)
}

func main() {
	val := callableFuction(func(x int) int {
		return x * 2
	})

	fmt.Println(val)
}
