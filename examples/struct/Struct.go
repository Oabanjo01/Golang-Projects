package main

import (
	"fmt"
)

type Person struct {
	name string
	age  int
	f    func(string) string
}

func (p Person) introduce(s string) string {
	return fmt.Sprintf("%s is %d years old.", s, p.age)
}

func main() {
	p := Person{name: "Alice", age: 30}
	fmt.Println(p.introduce(p.name))
}
