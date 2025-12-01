package config

import (
	"strconv"
)

type Config struct {
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	ServerPort       string
	JWTSecret        string
	JWTExpireHours   int
	AllowedOrigins   string
	UploadPath       string
	MaxUploadSize    int64
}

var AppConfig Config

// LoadConfig loads configuration from environment variables
func LoadConfig() {
	AppConfig = Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "root"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "sawit_db"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
		JWTSecret:      getEnv("JWT_SECRET", "sawit-secret-key-2025"),
		JWTExpireHours: getEnvAsInt("JWT_EXPIRE_HOURS", 72),
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"),
		UploadPath:     getEnv("UPLOAD_PATH", "./uploads"),
		MaxUploadSize:  getEnvAsInt64("MAX_UPLOAD_SIZE", 10485760),
	}
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsInt64(key string, defaultValue int64) int64 {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseInt(valueStr, 10, 64); err == nil {
		return value
	}
	return defaultValue
}
