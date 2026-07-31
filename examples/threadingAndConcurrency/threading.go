package main

import (
	"fmt"
	"time"
)

func run() {
	time.Sleep(2 * time.Second)
	fmt.Println("run 1")
}

func run2() {
	time.Sleep(3 * time.Second)
	fmt.Println("run 2")
}

func run3() {
	time.Sleep(4 * time.Second)
	fmt.Println("run 3")
}

// <-chan int (Receive-only): You can only read data out of this channel (x := <-ch).
// Trying to send data to it (ch <- 5) will result in a compile error.

// chan<- int (Send-only): You can only push data into this channel (ch <- 5).
// Trying to read from it (x := <-ch) will result in a compile error.

// chan int (Bidirectional): A standard channel that can both send and receive.
func add(a int, b int, ch chan int) {
	fmt.Println(a + b)
	ch <- a + b // an execution
}

func main() {
	// Go routines
	// go run()
	// go run2()
	// go run3()
	// time.Sleep(7 * time.Second)

	// channels and blocking codes
	// ch := make(chan int)
	// go add(4, 5, ch)
	// x := <-ch // This is the blocking code, waits for value from channel
	// go add(5, 5, ch)
	// x = <-ch
	// go add(6, 5, ch)
	// x = <-ch
	// go add(7, 5, ch)
	// x = <-ch

	// fmt.Println("Done", x)

	// ch := make(chan int)
	// ch2 := make(chan int)

	// go add(4, 5, ch)
	// go add(4, 5, ch2)

	// using select - waits for either of these values to have a value,
	// then goes into the case to handle the output
	// select {
	// case x := <-ch:
	// 	fmt.Println(x)
	// case y := <-ch2:
	// 	fmt.Println(y)
	// }
	ch := make(chan bool)
	ch <- true // a send channel, still a blocking operation
	<-ch       // a receive channel
	fmt.Println("Done")
}
