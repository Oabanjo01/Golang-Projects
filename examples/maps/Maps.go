package main

import "fmt"

func main() {
	// var mp map[string]int = map[string]int{"a": 1} // This is a declaration of a map with string keys and int values. The map is initialized with the zero value of the type, which is nil for maps.

	// mp := map[string]int{"a": 1} // This is a declaration of a map with string keys and int values. The map is initialized with the zero value of the type, which is nil for maps.
	// // mp1 := make(map[string]int)

	// mp["b"] = 2

	// delete(mp, "a")

	// fmt.Println(mp)

	mpEven := map[uint]uint{}
	valueToLoop := 100

	for i := range make([]uint, valueToLoop) {
		if (i % 2) == 0 {
			mpEven[uint(i)] = uint(i)
		} else {
			continue
		}
	}

	fmt.Println(mpEven)
}
