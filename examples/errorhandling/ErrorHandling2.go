package main

import "errors"

func Divide(a int, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("You cannot divide by 0")
	}
	return a / b, nil
}
