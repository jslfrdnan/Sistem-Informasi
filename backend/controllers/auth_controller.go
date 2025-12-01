package controllers

import (
	"database/sql"
	"net/http"
	"sawit-backend/config"
	"sawit-backend/middleware"
	"sawit-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Register handles user registration
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var exists int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ? OR username = ?", 
		req.Email, req.Username).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email or username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Insert user
	result, err := config.DB.Exec(`
		INSERT INTO users (username, email, password, role, company_name, address, nib, phone, status)
		VALUES (?, ?, ?, 'buyer', ?, ?, ?, ?, 'active')
	`, req.Username, req.Email, string(hashedPassword), req.CompanyName, req.Address, req.NIB, req.Phone)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	userID, _ := result.LastInsertId()

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user_id": userID,
	})
}

// Login handles user authentication
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from database
	var user models.User
	var companyName, address, nib, phone sql.NullString
	err := config.DB.QueryRow(`
		SELECT id, username, email, password, role, company_name, address, nib, phone, status
		FROM users WHERE email = ?
	`, req.Email).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password, &user.Role,
		&companyName, &address, &nib, &phone, &user.Status,
	)

	// Convert sql.NullString to *string
	if companyName.Valid {
		user.CompanyName = &companyName.String
	}
	if address.Valid {
		user.Address = &address.String
	}
	if nib.Valid {
		user.NIB = &nib.String
	}
	if phone.Valid {
		user.Phone = &phone.String
	}

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if user is active
	if user.Status != "active" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Account is inactive"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Log aktivitas
	config.DB.Exec(`
		INSERT INTO log_aktivitas (user_id, aktivitas, modul, ip_address)
		VALUES (?, 'Login', 'auth', ?)
	`, user.ID, c.ClientIP())

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

// GetProfile returns current user profile
func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	var companyName, address, nib, phone sql.NullString
	err := config.DB.QueryRow(`
		SELECT id, username, email, role, company_name, address, nib, phone, status, created_at, updated_at
		FROM users WHERE id = ?
	`, userID).Scan(
		&user.ID, &user.Username, &user.Email, &user.Role, &companyName,
		&address, &nib, &phone, &user.Status, &user.CreatedAt, &user.UpdatedAt,
	)

	// Convert sql.NullString to *string
	if companyName.Valid {
		user.CompanyName = &companyName.String
	}
	if address.Valid {
		user.Address = &address.String
	}
	if nib.Valid {
		user.NIB = &nib.String
	}
	if phone.Valid {
		user.Phone = &phone.String
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile updates user profile
func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		CompanyName string `json:"company_name"`
		Address     string `json:"address"`
		Phone       string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := config.DB.Exec(`
		UPDATE users SET company_name = ?, address = ?, phone = ?
		WHERE id = ?
	`, req.CompanyName, req.Address, req.Phone, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}
