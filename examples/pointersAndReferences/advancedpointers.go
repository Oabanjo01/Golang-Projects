// Advanced pointer types
package main

import "fmt"

func test(pointerSlice *[]*int) { // * on a type means its referencing to the fact that this is a pointer
	values := *pointerSlice //
	for _, value := range values {
		fmt.Println(value)
	}
}
