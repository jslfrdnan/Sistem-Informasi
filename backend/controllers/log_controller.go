package controllers

import (
	"net/http"
	"sawit-backend/config"
	"strconv"

	"github.com/gin-gonic/gin"
)

// LogAktivitas represents activity log structure
type LogAktivitas struct {
	ID           int    `json:"id"`
	UserID       int    `json:"user_id"`
	Username     string `json:"username"`
	Role         string `json:"role"`
	Aktivitas    string `json:"aktivitas"`
	Detail       string `json:"detail"`
	IPAddress    string `json:"ip_address"`
	UserAgent    string `json:"user_agent"`
	WaktuAktivitas string `json:"waktu_aktivitas"`
}

// GetLogAktivitas retrieves activity logs with filters
func GetLogAktivitas(c *gin.Context) {
	// Get query parameters for filtering
	userID := c.Query("user_id")
	aktivitas := c.Query("aktivitas")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "50")

	// Log endpoint access
	println("[LOG_CONTROLLER] GET /api/logs - Filters:", "user_id="+userID, "aktivitas="+aktivitas, "start_date="+startDate, "end_date="+endDate, "page="+page, "limit="+limit)

	pageNum, _ := strconv.Atoi(page)
	limitNum, _ := strconv.Atoi(limit)
	offset := (pageNum - 1) * limitNum

	// Build query
	query := `
		SELECT 
			la.id,
			COALESCE(la.user_id, 0) as user_id,
			COALESCE(u.username, 'System') as username,
			COALESCE(u.role, 'system') as role,
			COALESCE(la.aktivitas, '') as aktivitas,
			CASE 
				WHEN la.modul IS NOT NULL AND la.reference_id IS NOT NULL 
					THEN CONCAT(la.modul, ' - Ref ID: ', la.reference_id)
				WHEN la.modul IS NOT NULL 
					THEN la.modul
				ELSE la.aktivitas
			END as detail,
			COALESCE(la.ip_address, '') as ip_address,
			COALESCE(la.user_agent, '') as user_agent,
			la.created_at as waktu_aktivitas
		FROM log_aktivitas la
		LEFT JOIN users u ON la.user_id = u.id
		WHERE 1=1
	`
	
	args := []interface{}{}

	// Apply filters
	if userID != "" {
		query += " AND la.user_id = ?"
		args = append(args, userID)
	}
	if aktivitas != "" {
		query += " AND la.aktivitas LIKE ?"
		args = append(args, "%"+aktivitas+"%")
	}
	if startDate != "" {
		query += " AND DATE(la.created_at) >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND DATE(la.created_at) <= ?"
		args = append(args, endDate)
	}

	query += " ORDER BY la.created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limitNum, offset)

	// Execute query
	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch logs: " + err.Error()})
		return
	}
	defer rows.Close()

	logs := []LogAktivitas{}
	for rows.Next() {
		var log LogAktivitas
		err := rows.Scan(
			&log.ID,
			&log.UserID,
			&log.Username,
			&log.Role,
			&log.Aktivitas,
			&log.Detail,
			&log.IPAddress,
			&log.UserAgent,
			&log.WaktuAktivitas,
		)
		if err != nil {
			// Log error but continue processing other rows
			println("Error scanning log row:", err.Error())
			continue
		}
		logs = append(logs, log)
	}

	// Check for errors during iteration
	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error iterating logs: " + err.Error()})
		return
	}

	// Get total count for pagination
	countQuery := `
		SELECT COUNT(*) 
		FROM log_aktivitas la
		WHERE 1=1
	`
	countArgs := []interface{}{}

	if userID != "" {
		countQuery += " AND la.user_id = ?"
		countArgs = append(countArgs, userID)
	}
	if aktivitas != "" {
		countQuery += " AND la.aktivitas LIKE ?"
		countArgs = append(countArgs, "%"+aktivitas+"%")
	}
	if startDate != "" {
		countQuery += " AND DATE(la.created_at) >= ?"
		countArgs = append(countArgs, startDate)
	}
	if endDate != "" {
		countQuery += " AND DATE(la.created_at) <= ?"
		countArgs = append(countArgs, endDate)
	}

	var total int
	config.DB.QueryRow(countQuery, countArgs...).Scan(&total)

	// Ensure logs is never nil (return empty array instead)
	if logs == nil {
		logs = []LogAktivitas{}
	}

	// Log response summary
	println("[LOG_CONTROLLER] Response - Total logs:", total, "| Returned:", len(logs), "| Page:", pageNum, "/", (total+limitNum-1)/limitNum)

	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": total,
		"page":  pageNum,
		"limit": limitNum,
		"pages": (total + limitNum - 1) / limitNum,
	})
}

// GetLogStatistics retrieves activity statistics
func GetLogStatistics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	// Log endpoint access
	println("[LOG_CONTROLLER] GET /api/logs/statistics - Filters:", "start_date="+startDate, "end_date="+endDate)

	// Query for activity summary
	query := `
		SELECT 
			aktivitas,
			COUNT(*) as jumlah
		FROM log_aktivitas
		WHERE 1=1
	`
	
	args := []interface{}{}
	if startDate != "" {
		query += " AND DATE(created_at) >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND DATE(created_at) <= ?"
		args = append(args, endDate)
	}

	query += " GROUP BY aktivitas ORDER BY jumlah DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch statistics"})
		return
	}
	defer rows.Close()

	stats := []map[string]interface{}{}
	for rows.Next() {
		var aktivitas string
		var jumlah int
		rows.Scan(&aktivitas, &jumlah)
		stats = append(stats, map[string]interface{}{
			"aktivitas": aktivitas,
			"jumlah":    jumlah,
		})
	}

	// Query for user activity
	userQuery := `
		SELECT 
			u.username,
			u.role,
			COUNT(*) as jumlah_aktivitas
		FROM log_aktivitas la
		JOIN users u ON la.user_id = u.id
		WHERE 1=1
	`
	
	userArgs := []interface{}{}
	if startDate != "" {
		userQuery += " AND DATE(la.created_at) >= ?"
		userArgs = append(userArgs, startDate)
	}
	if endDate != "" {
		userQuery += " AND DATE(la.created_at) <= ?"
		userArgs = append(userArgs, endDate)
	}

	userQuery += " GROUP BY u.id, u.username, u.role ORDER BY jumlah_aktivitas DESC LIMIT 10"

	userRows, err := config.DB.Query(userQuery, userArgs...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user statistics"})
		return
	}
	defer userRows.Close()

	userStats := []map[string]interface{}{}
	for userRows.Next() {
		var username, role string
		var jumlah int
		userRows.Scan(&username, &role, &jumlah)
		userStats = append(userStats, map[string]interface{}{
			"username": username,
			"role":     role,
			"jumlah":   jumlah,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"activity_summary": stats,
		"top_users":        userStats,
	})
}
