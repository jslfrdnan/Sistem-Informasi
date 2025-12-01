package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

// InitDB initializes database connection
func InitDB() {
	var err error
	
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "sawit_db")

	// MySQL connection string: user:password@tcp(host:port)/dbname?parseTime=true
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Error opening database: ", err)
	}

	// Test connection
	err = DB.Ping()
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}

	// Set connection pool settings
	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	log.Println("Database connected successfully")
}

// CloseDB closes database connection
func CloseDB() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}

// getEnv gets environment variable or returns default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
