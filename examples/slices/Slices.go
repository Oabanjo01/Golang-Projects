package main

import (
	"fmt"
)

func main() {
	// slices are a flexible version of arrays in go.
	// this is a view of an array, and it can be resized and appended to.
	// We can take a part of a slice or an array and create a new slice from it.

	// pointers in slices are used to point to the underlying array, and they are used to keep track of the length and capacity of the slice.
	// capacity is the total number of elements that can be stored in the underlying array.
	// length is the number of elements in the slice.

	// arr := [6]int{1, 2, 3, 4, 5, 6}
	// slice := arr[3:4] // Creates a slice from index 3 to 4 (4 is not included)

	// fmt.Println(slice, len(slice), cap(slice))

	// Creating slices without an underlying array
	// 1
	// slice2 := []string{"a", "b", "c", "d", "e", "f"}

	// for i := 0; i < 10; i++ {
	// 	slice2 = append(slice2, "g") // Appending to a slice will create a new underlying array if the capacity is exceeded.
	// 	fmt.Println(slice2, len(slice2), cap(slice2))
	// }
	// fmt.Printf("%T", slice2)

	// 2 - make function - make([]T, len, cap) - creates a slice with a specified length and capacity.
	slice3 := make([]int, 5, 10) // creates a slice of length 5 and capacity 10. Dynamically create different sizes of slices. The underlying array will be created with the specified capacity, and the slice will be created with the specified length.

	for _, value := range slice3 {
		slice3 = append(slice3, value)

		fmt.Println(slice3, len(slice3), cap(slice3))
	}
}

// Unlike array, we mutate the actual slice, and the changes will be reflected in the original slice because slices are passed by reference in Go. This means that a reference to the slice is passed to the function, and any changes made to the slice inside the function will affect the original slice.
func test(slice []int) {
	slice[0] = 100 // This will work because slices are passed by reference in Go. This means that a reference to the slice is passed to the function, and any changes made to the slice inside the function will affect the original slice.
}
