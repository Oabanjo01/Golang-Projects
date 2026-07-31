package main

type Number interface {
	int | float64
}

// | union - combines types
// generics - T (usually) means whether its an int or float, they must be of the same type T
func add[T Number](x T, y T) T {
	var sum T = x + y
	return sum
}

// comparable - implements a comparable interface, all keys need this
// any accepts any value
// Map[K]V - K is the key, the value is V

func getValues[T comparable, V any](mp map[T]V) []V {
	values := []V{}

	for _, value := range mp {
		values = append(values, value)
	}

	return values
}

func main() {
	// val := map[string]any{"a": 100, "b": 200, "c": "djjd"}

	// values := getValues(val)
	// fmt.Println(values)

	customSlice()
}
