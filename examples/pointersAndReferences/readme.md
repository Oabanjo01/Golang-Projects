<!-- // How RAM works in Go -->

## RAM - the location the application is stored temporarily at in a computer.

Address associated with values and data are at the places.

`x := 0` - Here we allocate an address to this variable, and use the address to reference the 0 value

`y := 0 `- same value different address
if we do y := x - we copy that x value to y's address

## Slices

s := []int{1, 2, 3}
We create two addresses - the first stores the array - {1, 2, 3}, the second stores the length, capacity and pointer to the location the array exists
We can modify the array using the pointer to that array. so `s[0] = 100` - works
t := s - stores the same pointer to the same array, so changes affects s.

## Functions

func change (x int) {
    x = 7 - we copy the value of a to a new address for the scoped x
}
a := 10 - different address
change a

fun change (s []int) {
    s[0] = 100 - we copy that value from s along with the pointer to s arrays address.
    so the changes here actually affects the initial array  
}
v := []int{1, 2, 3} - we create the slice (length, capacity & pointer) and add to that v address
change(v)

## Pointers &represents the pointer. * - means the reference. reference == pointer in Golang
x := 0
y := &x - we create a ponter to the memory address of x. We can now modify x from y
We do this using the the reference
*y = 100
