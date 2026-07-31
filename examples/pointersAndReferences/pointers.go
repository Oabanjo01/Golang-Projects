package main

import "fmt"

func change(x *int) { // *int - creates a pointer to an int value
	*x = 100 // derence the pointer and find the stored location
}

// Modifying structs using pointers - Only works on struct
type Book struct {
	id      int
	content string
}

func (b *Book) readBook(content string) {
	b.content = content // *b Go automaticaly dereferences our b reference
}

func main() {
	// x := 0
	// y := &x

	// *y = 100 // modifying x trough the pointer to x
	// fmt.Println(*y) // * helps to derefence bygoing to fetch the value from the address.

	// a := 10

	// change(&a)
	// fmt.Println(a)

	// b := Book{3, "This is the content"}
	// b.readBook("This is a new content") // We can implicitly do (&b).readbook. But the b *Book already implies it for go

	// fmt.Println(b)

	// Advanced pointers
	a := 1
	b := 2
	c := 3
	// *d - you are dereferencing
	// &d - you are getting the reference to a value
	values := &[]*int{&a, &b, &c}

	fmt.Println(values) // we get the addressed of these value references

	test(values)
}
