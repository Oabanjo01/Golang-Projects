package main

import (
	"fmt"
)

// Custom slices
type GenericSlice[T any] []T

func (g GenericSlice[T]) Print() {
	for _, val := range g {
		fmt.Println(val)
	}
}

// Custom structs
type GenericStruct[T any] struct {
	values T
}

func customSlice() {
	g := GenericSlice[int]{1, 2, 3}

	// st := GenericStruct[string]{values: "type"}

	g.Print()
}
