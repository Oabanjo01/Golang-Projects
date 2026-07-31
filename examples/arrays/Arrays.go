package main

import (
	"fmt"
)

func main() {
	// Arrays are fixed size, so you need to define the size of the array when you declare it.
	// Thee type of the array is also defined by the type of the elements in the array.
	// You cannot change the size of the array after it has been declared.

	// var arr [2]int // This is a declaration of an array of integers with a size of 2. The array is initialized with the zero value of the type, which is 0 for integers.

	// arr := [2]int{1, 2} // Implicit assignment operator - This is a literal array, which is a way to declare and initialize an array at the same time.

	arr := [...][2]int{{1, 2}, {3, 4}, {76, 3}} // counts the array for us.

	// arr[0] = [2]int{3, 7} // I can mutate the array.

	test(arr)

	fmt.Println(arr) // This will print the original array, not the mutated array, because arrays are passed by value in Go. This means that a copy of the array is passed to the function, and any changes made to the array inside the function will not affect the original array.

	// fmt.Println(len(arr))

	// fmt.Println(arr)

	// Looping through an array

	// for i := 0; i < len(arr); i++ {
	// 	fmt.Println(arr[i])
	// }

	// for _, outerArr := range arr {
	// 	fmt.Println(outerArr)

	// 	for _, nestedArr := range outerArr {
	// 		fmt.Println(nestedArr)
	// 	}
	// }
}

func test(arr [3][2]int) {
	arr[0] = [2]int{1, 2} // This will not work because arrays are passed by value in Go. This means that a copy of the array is passed to the function, and any changes made to the array inside the function will not affect the original array.
}
