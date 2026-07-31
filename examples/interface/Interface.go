package main

type Shape interface {
	getPerimeter() float64
}

type Triangle struct {
	a float64
	b float64
	c float64
}
type Square struct {
	a float64
	b float64
	c float64
}

func (t Triangle) getPerimeter() float64 {
	return t.a + t.b + t.c
}

func (t Square) getPerimeter() float64 {
	return t.a + t.b + t.c
}

func sum(nums ...int) (b int, s2 int) {
	for _, num := range nums {
		b += num
		s2 += num * num
	}

	return
}

func main() {
	// var s []Shape = []Shape{Triangle{a: 3, b: 4, c: 5}, Square{a: 4, b: 4, c: 4}}
	b, s2 := sum([]int{3, 4, 5, 4, 4, 4}...)
	println(b, s2)
}
