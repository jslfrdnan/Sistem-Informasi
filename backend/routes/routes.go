package routes

import (
	"sawit-backend/controllers"
	"sawit-backend/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all application routes
func SetupRoutes(router *gin.Engine) {
	// Public routes
	api := router.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}
	}

	// Protected routes (require authentication)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Profile
		protected.GET("/profile", controllers.GetProfile)
		protected.PUT("/profile", controllers.UpdateProfile)

		// Kebun (all authenticated users)
		protected.GET("/kebun", controllers.GetKebunList)

		// Stok TBS
		stok := protected.Group("/stok")
		{
			stok.GET("", controllers.GetStokList)
			stok.GET("/:id", controllers.GetStokDetail)
			
			// Admin only
			stok.POST("", middleware.RoleMiddleware("admin", "staff"), controllers.CreateStok)
			stok.PUT("/:id", middleware.RoleMiddleware("admin", "staff"), controllers.UpdateStok)
		}

		// Purchase Orders
		po := protected.Group("/purchase-orders")
		{
			po.GET("", controllers.GetPurchaseOrders)
			po.GET("/:id", controllers.GetPurchaseOrderDetail)
			po.POST("", middleware.RoleMiddleware("buyer"), controllers.CreatePurchaseOrder)
			po.DELETE("/:id", controllers.CancelPurchaseOrder)
			
			// Admin only
			po.PUT("/:id/status", middleware.RoleMiddleware("admin", "staff"), controllers.UpdatePOStatus)
		}

		// Jadwal Pengambilan
		jadwal := protected.Group("/jadwal")
		{
			jadwal.GET("", controllers.GetJadwalList)
			jadwal.POST("", middleware.RoleMiddleware("admin", "staff"), controllers.CreateJadwal)
		}

		// Timbangan
		timbang := protected.Group("/timbangan")
		{
			timbang.GET("", controllers.GetTimbangan)
			timbang.POST("/:id/weigh-in", middleware.RoleMiddleware("staff", "admin"), controllers.WeighIn)
			timbang.POST("/:id/weigh-out", middleware.RoleMiddleware("staff", "admin"), controllers.WeighOut)
		}

		// Dokumen Penjualan
		dokumen := protected.Group("/dokumen")
		{
			dokumen.GET("", controllers.GetDokumen)
		}

		// Pembayaran
		pembayaran := protected.Group("/pembayaran")
		{
			pembayaran.GET("", controllers.GetPembayaran)
			pembayaran.POST("", middleware.RoleMiddleware("buyer"), controllers.CreatePembayaran)
			pembayaran.PUT("/:id/verify", middleware.RoleMiddleware("admin", "staff"), controllers.VerifyPembayaran)
		}

		// Reports & Dashboard
		reports := protected.Group("/reports")
		{
			reports.GET("/daily-sales", middleware.RoleMiddleware("admin", "staff"), controllers.GetDailySales)
			reports.GET("/dashboard", controllers.GetDashboardStats)
		}
	}
}
