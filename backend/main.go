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
	log.Printf("🌴 Sawit API Server - Port %s", port)
	
	// Print all available endpoints
	printEndpoints(port)
	
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}

func printEndpoints(port string) {
	log.Println("\n📋 Available Endpoints:")
	log.Println("  GET    /health")
	log.Println("  POST   /api/auth/register")
	log.Println("  POST   /api/auth/login")
	log.Println("  GET    /api/profile")
	log.Println("  PUT    /api/profile")
	log.Println("  GET    /api/kebun")
	log.Println("  GET    /api/stok")
	log.Println("  GET    /api/stok/:id")
	log.Println("  POST   /api/stok")
	log.Println("  PUT    /api/stok/:id")
	log.Println("  GET    /api/purchase-orders")
	log.Println("  GET    /api/purchase-orders/:id")
	log.Println("  POST   /api/purchase-orders")
	log.Println("  PUT    /api/purchase-orders/:id/status")
	log.Println("  DELETE /api/purchase-orders/:id")
	log.Println("  GET    /api/jadwal")
	log.Println("  POST   /api/jadwal")
	log.Println("  GET    /api/timbangan")
	log.Println("  POST   /api/timbangan/:id/weigh-in")
	log.Println("  POST   /api/timbangan/:id/weigh-out")
	log.Println("  GET    /api/dokumen")
	log.Println("  GET    /api/pembayaran")
	log.Println("  POST   /api/pembayaran")
	log.Println("  PUT    /api/pembayaran/:id/verify")
	log.Println("  GET    /api/reports/dashboard")
	log.Println("  GET    /api/reports/daily-sales")
	log.Println("  GET    /api/logs")
	log.Println("  GET    /api/logs/statistics")
	log.Printf("\n✅ Server ready: http://localhost:%s\n", port)
}
