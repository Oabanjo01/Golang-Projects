package main

import "fmt"

type Person struct {
	name string
	age  int
	f    func(string) string
}

// func getName(p Person) string {
// 	return p.name
// }

// (p Person) - a receiver, telling us this method belongs to Person struct.
func (p Person) getName() string {
	return p.name
}

func main() {
	// A struct is a typed collection of fields. Structs are useful for grouping data together to form records.
	p1 := Person{name: "John"}

	useName := p1.getName() // This will call the getName method on the p1 struct, which will return the name of the person.

	fmt.Println(useName)
}
