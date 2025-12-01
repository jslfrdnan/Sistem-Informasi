package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	passwords := []string{"admin123", "staff123", "buyer123"}
	
	for _, pwd := range passwords {
		hash, err := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
		if err != nil {
			fmt.Println("Error:", err)
			continue
		}
		fmt.Printf("%s -> %s\n", pwd, string(hash))
	}
}
