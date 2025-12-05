# Guest Details Backend Implementation Guide

## Overview
This guide explains how to implement the guest details logic in your Go backend to provide comprehensive guest information including statistics, service usage, and enriched data.

## Current Architecture

Your backend already has:
- ✅ Models defined (`Guest`, `GuestPreferences`, `GuestAIInsights`)
- ✅ Routes configured (`GET /api/v1/guests/:id`)
- ✅ Basic CRUD operations

**What's Missing:**
- ❌ Statistics calculation (total stays, total spent, etc.)
- ❌ Service usage aggregation
- ❌ Handler implementation for enriched guest details

---

## Step 1: Create Handler File

Create a new file: `backend/handlers/guest_handlers.go`

```go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"your-project/models"
	"your-project/responses"
)

type GuestHandler struct {
	DB *gorm.DB
}

func NewGuestHandler(db *gorm.DB) *GuestHandler {
	return &GuestHandler{DB: db}
}
```

---

## Step 2: Implement GetGuestByID with Full Details

Add this method to `guest_handlers.go`:

```go
// GetGuestByID retrieves a guest with all related data
func (h *GuestHandler) GetGuestByID(c *gin.Context) {
	// Parse guest ID
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid guest ID"))
		return
	}

	// Fetch guest with all relations
	var guest models.Guest
	err = h.DB.
		Preload("Reservations").
		Preload("ServiceRequests").
		Preload("Preferences").
		Preload("AIInsights").
		First(&guest, guestID).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, responses.ErrorResponse("Guest not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, responses.ErrorResponse("Failed to fetch guest"))
		return
	}

	// Calculate statistics
	statistics := h.calculateGuestStatistics(uint(guestID))

	// Calculate service usage
	serviceUsage := h.calculateServiceUsage(uint(guestID))

	// Build enriched response
	enrichedGuest := map[string]interface{}{
		"id":            guest.ID,
		"name":          guest.Name,
		"email":         guest.Email,
		"phone":         guest.Phone,
		"nationality":   guest.Nationality,
		"id_type":       guest.IDType,
		"id_number":     guest.IDNumber,
		"join_date":     guest.JoinDate,
		"created_at":    guest.CreatedAt,
		"updated_at":    guest.UpdatedAt,
		"reservations":  guest.Reservations,
		"preferences":   guest.Preferences,
		"ai_insights":   guest.AIInsights,
		"statistics":    statistics,
		"service_usage": serviceUsage,
	}

	c.JSON(http.StatusOK, responses.SuccessResponse("Guest retrieved successfully", enrichedGuest))
}
```

---

## Step 3: Implement Statistics Calculation

Add this helper method:

```go
// GuestStatistics represents calculated guest statistics
type GuestStatistics struct {
	TotalStays    int       `json:"total_stays"`
	TotalSpent    float64   `json:"total_spent"`
	AverageSpend  float64   `json:"average_spend"`
	LastVisit     time.Time `json:"last_visit"`
	MostCommonRoom string   `json:"most_common_room"`
}

// calculateGuestStatistics computes statistics from guest's reservation history
func (h *GuestHandler) calculateGuestStatistics(guestID uint) GuestStatistics {
	var stats GuestStatistics

	// Get all completed reservations
	var reservations []models.Reservation
	h.DB.Where("guest_id = ? AND status IN (?)", guestID, []string{"completed", "checked-out"}).
		Preload("Room").
		Order("check_out_date DESC").
		Find(&reservations)

	// Calculate statistics
	stats.TotalStays = len(reservations)
	
	var totalSpent float64
	roomCounts := make(map[string]int)
	
	for _, res := range reservations {
		totalSpent += res.TotalPrice
		
		// Track room types
		if res.Room.RoomType != "" {
			roomCounts[res.Room.RoomType]++
		}
		
		// Get last visit (most recent check-out)
		if stats.LastVisit.IsZero() || res.CheckOutDate.After(stats.LastVisit) {
			stats.LastVisit = res.CheckOutDate
		}
	}
	
	stats.TotalSpent = totalSpent
	
	if stats.TotalStays > 0 {
		stats.AverageSpend = totalSpent / float64(stats.TotalStays)
	}
	
	// Find most common room type
	maxCount := 0
	for roomType, count := range roomCounts {
		if count > maxCount {
			maxCount = count
			stats.MostCommonRoom = roomType
		}
	}

	return stats
}
```

---

## Step 4: Implement Service Usage Calculation

Add this helper method:

```go
// ServiceUsageItem represents service usage statistics
type ServiceUsageItem struct {
	Type  string `json:"type"`
	Label string `json:"label"`
	Count int    `json:"count"`
}

// calculateServiceUsage aggregates service request types for a guest
func (h *GuestHandler) calculateServiceUsage(guestID uint) []ServiceUsageItem {
	// Count service requests by type
	var results []struct {
		ServiceType string
		Count       int64
	}

	h.DB.Model(&models.ServiceRequest{}).
		Select("service_type, COUNT(*) as count").
		Where("guest_id = ?", guestID).
		Group("service_type").
		Scan(&results)

	// Map to friendly labels
	serviceLabels := map[string]string{
		"room-service":        "Room Service",
		"housekeeping":        "Housekeeping",
		"maintenance":         "Maintenance",
		"special-requests":    "Special Requests",
		"transportation":      "Transportation",
		"general-assistance":  "General Assistance",
	}

	var usage []ServiceUsageItem
	for _, result := range results {
		label := serviceLabels[result.ServiceType]
		if label == "" {
			label = result.ServiceType
		}

		usage = append(usage, ServiceUsageItem{
			Type:  result.ServiceType,
			Label: label,
			Count: int(result.Count),
		})
	}

	return usage
}
```

---

## Step 5: Implement Other Guest Endpoints

### Get All Guests (Paginated)

```go
// GetGuests retrieves paginated list of guests
func (h *GuestHandler) GetGuests(c *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	// Build query
	query := h.DB.Model(&models.Guest{})

	// Apply search filter
	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get guests
	var guests []models.Guest
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&guests)

	// Calculate total pages
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	// Build response
	response := map[string]interface{}{
		"data": guests,
		"meta": map[string]interface{}{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": totalPages,
		},
	}

	c.JSON(http.StatusOK, responses.SuccessResponse("Guests retrieved successfully", response))
}
```

### Create Guest

```go
// CreateGuest creates a new guest with initial preferences and AI insights
func (h *GuestHandler) CreateGuest(c *gin.Context) {
	var req responses.CreateGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid request data"))
		return
	}

	// Check for duplicate email
	var existingGuest models.Guest
	if err := h.DB.Where("email = ?", req.Email).First(&existingGuest).Error; err == nil {
		c.JSON(http.StatusConflict, responses.ErrorResponse("Email already exists"))
		return
	}

	// Create guest
	guest := models.Guest{
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		Nationality: req.Nationality,
		IDType:      req.IDType,
		IDNumber:    req.IDNumber,
		JoinDate:    time.Now(),
	}

	// Start transaction
	tx := h.DB.Begin()

	// Create guest record
	if err := tx.Create(&guest).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, responses.ErrorResponse("Failed to create guest"))
		return
	}

	// Initialize preferences
	preferences := models.GuestPreferences{
		GuestID:         guest.ID,
		RoomFloors:      []string{},
		MealTypes:       []string{},
		RoomTypes:       []string{},
		SpecialRequests: []string{},
	}
	if err := tx.Create(&preferences).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, responses.ErrorResponse("Failed to create preferences"))
		return
	}

	// Initialize AI insights
	aiInsights := models.GuestAIInsights{
		GuestID:         guest.ID,
		MealPreference:  "",
		RoomPreference:  "",
		ServicePattern:  "",
		RiskScore:       "low",
		Recommendations: []string{},
		Complaints:      []string{},
	}
	if err := tx.Create(&aiInsights).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, responses.ErrorResponse("Failed to create AI insights"))
		return
	}

	// Commit transaction
	tx.Commit()

	c.JSON(http.StatusCreated, responses.SuccessResponse("Guest created successfully", guest))
}
```

### Update Guest

```go
// UpdateGuest updates guest information
func (h *GuestHandler) UpdateGuest(c *gin.Context) {
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid guest ID"))
		return
	}

	var guest models.Guest
	if err := h.DB.First(&guest, guestID).Error; err != nil {
		c.JSON(http.StatusNotFound, responses.ErrorResponse("Guest not found"))
		return
	}

	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid request data"))
		return
	}

	// Update only provided fields
	if err := h.DB.Model(&guest).Updates(req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, responses.ErrorResponse("Failed to update guest"))
		return
	}

	c.JSON(http.StatusOK, responses.SuccessResponse("Guest updated successfully", guest))
}
```

### Delete Guest

```go
// DeleteGuest soft deletes a guest
func (h *GuestHandler) DeleteGuest(c *gin.Context) {
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid guest ID"))
		return
	}

	if err := h.DB.Delete(&models.Guest{}, guestID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, responses.ErrorResponse("Failed to delete guest"))
		return
	}

	c.JSON(http.StatusOK, responses.SuccessResponse("Guest deleted successfully", nil))
}
```

---

## Step 6: Update Routes Configuration

Update `backend/routes/routes.go`:

```go
package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"your-project/handlers"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize handlers
	guestHandler := handlers.NewGuestHandler(db)

	v1 := router.Group("/api/v1")
	{
		// Guest routes
		guests := v1.Group("/guests")
		{
			guests.GET("", guestHandler.GetGuests)
			guests.GET("/:id", guestHandler.GetGuestByID)
			guests.POST("", guestHandler.CreateGuest)
			guests.PUT("/:id", guestHandler.UpdateGuest)
			guests.DELETE("/:id", guestHandler.DeleteGuest)
			guests.GET("/:id/history", guestHandler.GetGuestHistory)
			guests.GET("/:id/preferences", guestHandler.GetGuestPreferences)
			guests.GET("/:id/ai-insights", guestHandler.GetGuestAIInsights)
		}
	}
}
```

---

## Step 7: Add Additional Endpoints (Optional)

### Get Guest History

```go
// GetGuestHistory retrieves all reservations for a guest
func (h *GuestHandler) GetGuestHistory(c *gin.Context) {
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid guest ID"))
		return
	}

	var reservations []models.Reservation
	h.DB.Where("guest_id = ?", guestID).
		Preload("Room").
		Order("check_in_date DESC").
		Find(&reservations)

	c.JSON(http.StatusOK, responses.SuccessResponse("Guest history retrieved successfully", reservations))
}
```

### Get Guest Preferences

```go
// GetGuestPreferences retrieves guest preferences
func (h *GuestHandler) GetGuestPreferences(c *gin.Context) {
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid guest ID"))
		return
	}

	var preferences models.GuestPreferences
	if err := h.DB.Where("guest_id = ?", guestID).First(&preferences).Error; err != nil {
		c.JSON(http.StatusNotFound, responses.ErrorResponse("Preferences not found"))
		return
	}

	c.JSON(http.StatusOK, responses.SuccessResponse("Preferences retrieved successfully", preferences))
}
```

### Get Guest AI Insights

```go
// GetGuestAIInsights retrieves AI insights for a guest
func (h *GuestHandler) GetGuestAIInsights(c *gin.Context) {
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, responses.ErrorResponse("Invalid guest ID"))
		return
	}

	var aiInsights models.GuestAIInsights
	if err := h.DB.Where("guest_id = ?", guestID).First(&aiInsights).Error; err != nil {
		c.JSON(http.StatusNotFound, responses.ErrorResponse("AI insights not found"))
		return
	}

	c.JSON(http.StatusOK, responses.SuccessResponse("AI insights retrieved successfully", aiInsights))
}
```

---

## Step 8: Update Response Helpers

Ensure `backend/responses/responses.go` has these helpers:

```go
package responses

// SuccessResponse creates a standardized success response
func SuccessResponse(message string, data interface{}) map[string]interface{} {
	return map[string]interface{}{
		"message": message,
		"data":    data,
		"errors":  "",
		"status":  "OK",
	}
}

// ErrorResponse creates a standardized error response
func ErrorResponse(message string) map[string]interface{} {
	return map[string]interface{}{
		"message": "Error",
		"data":    nil,
		"errors":  message,
		"status":  "ERROR",
	}
}
```

---

## Testing Your Implementation

### 1. Test Get Guest by ID
```bash
curl -X GET http://localhost:8080/api/v1/guests/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Guest retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "statistics": {
      "total_stays": 5,
      "total_spent": 2500.00,
      "average_spend": 500.00,
      "last_visit": "2024-12-01T00:00:00Z",
      "most_common_room": "Deluxe"
    },
    "service_usage": [
      {"type": "room-service", "label": "Room Service", "count": 10},
      {"type": "housekeeping", "label": "Housekeeping", "count": 3}
    ]
  }
}
```

### 2. Test Create Guest
```bash
curl -X POST http://localhost:8080/api/v1/guests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "nationality": "USA",
    "id_type": "Passport",
    "id_number": "US123456"
  }'
```

---

## Summary

This implementation provides:

✅ **Full guest details** with statistics and service usage  
✅ **Paginated guest list** with search  
✅ **Guest creation** with automatic preferences/AI insights initialization  
✅ **Guest updates** and deletion  
✅ **Separate endpoints** for history, preferences, and AI insights  
✅ **Proper error handling** and validation  
✅ **Transaction support** for data integrity  

The backend now calculates statistics dynamically from reservation data and provides comprehensive guest profiles to the frontend.
