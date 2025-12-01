package main

import (
	"log"
	"os"
	"sawit-backend/config"
	"sawit-backend/middleware"
	"sawit-backend/routes"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Initialize database
	config.InitDB()
	defer config.CloseDB()

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create Gin router
	router := gin.Default()

	// Setup CORS
	allowedOrigins := strings.Split(config.AppConfig.AllowedOrigins, ",")
	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Add custom logger middleware
	router.Use(middleware.Logger())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Sistem Informasi Perkebunan Kelapa Sawit API",
		})
	})

	// Setup routes
	routes.SetupRoutes(router)

	// Create uploads directory
	os.MkdirAll(config.AppConfig.UploadPath, os.ModePerm)

	// Start server
	port := config.AppConfig.ServerPort
	log.Printf("🌴 Server running on port %s", port)
	log.Printf("📊 API Documentation: http://localhost:%s/health", port)
	
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
