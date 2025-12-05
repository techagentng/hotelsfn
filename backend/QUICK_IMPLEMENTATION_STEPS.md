# Quick Implementation Steps for Guest Details

## TL;DR - What You Need to Do

Your backend needs to calculate and return **statistics** and **service_usage** when fetching a guest by ID. Here's the minimal implementation:

---

## File Structure You'll Create

```
backend/
├── handlers/
│   └── guest_handlers.go    (NEW - create this)
├── main.go                   (UPDATE - wire up handlers)
└── routes/
    └── routes.go             (UPDATE - use new handlers)
```

---

## Step 1: Create `handlers/guest_handlers.go`

This is the main file where all the logic lives. Create it with this minimal version:

```go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"your-module-path/models"      // Update this to your actual module path
	"your-module-path/responses"   // Update this to your actual module path
)

type GuestHandler struct {
	DB *gorm.DB
}

func NewGuestHandler(db *gorm.DB) *GuestHandler {
	return &GuestHandler{DB: db}
}

// GetGuestByID - Main endpoint that returns enriched guest data
func (h *GuestHandler) GetGuestByID(c *gin.Context) {
	guestID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid guest ID"})
		return
	}

	// Fetch guest with relations
	var guest models.Guest
	err = h.DB.
		Preload("Reservations.Room").
		Preload("Preferences").
		Preload("AIInsights").
		First(&guest, guestID).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Guest not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch guest"})
		return
	}

	// Calculate statistics from reservations
	statistics := h.calculateStatistics(guest.Reservations)
	
	// Calculate service usage
	serviceUsage := h.calculateServiceUsage(uint(guestID))

	// Build response
	response := gin.H{
		"message": "Guest retrieved successfully",
		"data": gin.H{
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
			"statistics":    statistics,      // NEW
			"service_usage": serviceUsage,    // NEW
		},
	}

	c.JSON(http.StatusOK, response)
}

// Helper: Calculate statistics from reservations
func (h *GuestHandler) calculateStatistics(reservations []models.Reservation) gin.H {
	totalStays := 0
	totalSpent := 0.0
	var lastVisit time.Time
	roomTypes := make(map[string]int)

	for _, res := range reservations {
		if res.Status == "completed" || res.Status == "checked-out" {
			totalStays++
			totalSpent += res.TotalPrice
			
			if res.CheckOutDate.After(lastVisit) {
				lastVisit = res.CheckOutDate
			}
			
			if res.Room.RoomType != "" {
				roomTypes[res.Room.RoomType]++
			}
		}
	}

	// Find most common room
	mostCommonRoom := ""
	maxCount := 0
	for roomType, count := range roomTypes {
		if count > maxCount {
			maxCount = count
			mostCommonRoom = roomType
		}
	}

	avgSpend := 0.0
	if totalStays > 0 {
		avgSpend = totalSpent / float64(totalStays)
	}

	return gin.H{
		"totalStays":      totalStays,
		"totalSpent":      totalSpent,
		"averageSpend":    avgSpend,
		"lastVisit":       lastVisit,
		"mostCommonRoom":  mostCommonRoom,
	}
}

// Helper: Calculate service usage
func (h *GuestHandler) calculateServiceUsage(guestID uint) []gin.H {
	var results []struct {
		ServiceType string
		Count       int64
	}

	h.DB.Model(&models.ServiceRequest{}).
		Select("service_type, COUNT(*) as count").
		Where("guest_id = ?", guestID).
		Group("service_type").
		Scan(&results)

	labels := map[string]string{
		"room-service":       "Room Service",
		"housekeeping":       "Housekeeping",
		"maintenance":        "Maintenance",
		"special-requests":   "Special Requests",
		"transportation":     "Transportation",
		"general-assistance": "General Assistance",
	}

	usage := []gin.H{}
	for _, r := range results {
		label := labels[r.ServiceType]
		if label == "" {
			label = r.ServiceType
		}
		usage = append(usage, gin.H{
			"type":  r.ServiceType,
			"label": label,
			"count": r.Count,
		})
	}

	return usage
}

// GetGuests - Paginated list
func (h *GuestHandler) GetGuests(c *gin.Context) {
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
	query := h.DB.Model(&models.Guest{})

	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var guests []models.Guest
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&guests)

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guests retrieved successfully",
		"data": gin.H{
			"data": guests,
			"meta": gin.H{
				"page":        page,
				"page_size":   pageSize,
				"total":       total,
				"total_pages": totalPages,
			},
		},
	})
}

// CreateGuest - Create new guest
func (h *GuestHandler) CreateGuest(c *gin.Context) {
	var req responses.CreateGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check duplicate email
	var existing models.Guest
	if err := h.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	guest := models.Guest{
		Name:        req.Name,
		Email:       req.Email,
		Phone:       req.Phone,
		Nationality: req.Nationality,
		IDType:      req.IDType,
		IDNumber:    req.IDNumber,
		JoinDate:    time.Now(),
	}

	tx := h.DB.Begin()

	if err := tx.Create(&guest).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create guest"})
		return
	}

	// Create preferences
	prefs := models.GuestPreferences{GuestID: guest.ID}
	tx.Create(&prefs)

	// Create AI insights
	insights := models.GuestAIInsights{
		GuestID:   guest.ID,
		RiskScore: "low",
	}
	tx.Create(&insights)

	tx.Commit()

	c.JSON(http.StatusCreated, gin.H{
		"message": "Guest created successfully",
		"data":    guest,
	})
}

// UpdateGuest - Update guest
func (h *GuestHandler) UpdateGuest(c *gin.Context) {
	guestID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var guest models.Guest
	if err := h.DB.First(&guest, guestID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guest not found"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	h.DB.Model(&guest).Updates(updates)
	c.JSON(http.StatusOK, gin.H{"message": "Guest updated", "data": guest})
}

// DeleteGuest - Delete guest
func (h *GuestHandler) DeleteGuest(c *gin.Context) {
	guestID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.Guest{}, guestID)
	c.JSON(http.StatusOK, gin.H{"message": "Guest deleted"})
}

// GetGuestHistory - Get reservations
func (h *GuestHandler) GetGuestHistory(c *gin.Context) {
	guestID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var reservations []models.Reservation
	h.DB.Where("guest_id = ?", guestID).
		Preload("Room").
		Order("check_in_date DESC").
		Find(&reservations)

	c.JSON(http.StatusOK, gin.H{
		"message": "History retrieved",
		"data":    reservations,
	})
}

// GetGuestPreferences - Get preferences
func (h *GuestHandler) GetGuestPreferences(c *gin.Context) {
	guestID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var prefs models.GuestPreferences
	h.DB.Where("guest_id = ?", guestID).First(&prefs)

	c.JSON(http.StatusOK, gin.H{
		"message": "Preferences retrieved",
		"data":    prefs,
	})
}

// GetGuestAIInsights - Get AI insights
func (h *GuestHandler) GetGuestAIInsights(c *gin.Context) {
	guestID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var insights models.GuestAIInsights
	h.DB.Where("guest_id = ?", guestID).First(&insights)

	c.JSON(http.StatusOK, gin.H{
		"message": "AI insights retrieved",
		"data":    insights,
	})
}
```

---

## Step 2: Update `routes/routes.go`

Replace the placeholder handlers with your new handler:

```go
package routes

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"your-module-path/handlers"  // Update to your module path
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	// Initialize handler
	guestHandler := handlers.NewGuestHandler(db)

	v1 := router.Group("/api/v1")
	{
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
		
		// ... your other routes (reservations, rooms, etc.)
	}
}
```

---

## Step 3: Update Your Module Path

In both files above, replace `your-module-path` with your actual Go module path. 

To find it, check the first line of your `backend/go.mod` file:
```go
module github.com/yourusername/hotel-backend  // <- This is your module path
```

---

## Step 4: Test It

### Start your backend:
```bash
cd backend
go run main.go
```

### Test the endpoint:
```bash
# Get guest with full details
curl http://localhost:8080/api/v1/guests/1

# Expected response includes:
# - statistics: { totalStays, totalSpent, averageSpend, lastVisit, mostCommonRoom }
# - service_usage: [{ type, label, count }]
```

---

## What This Does

1. **`GetGuestByID`** now returns:
   - All basic guest info
   - Reservations (with room details)
   - Preferences
   - AI Insights
   - **Statistics** (calculated from reservations)
   - **Service Usage** (aggregated from service requests)

2. **Statistics** are calculated dynamically:
   - Counts completed reservations
   - Sums total spent
   - Calculates average spend
   - Finds last visit date
   - Determines most common room type

3. **Service Usage** aggregates:
   - Groups service requests by type
   - Counts each type
   - Maps to friendly labels

---

## Common Issues & Fixes

### Issue: "cannot find package"
**Fix:** Update import paths to match your `go.mod` module name

### Issue: "undefined: responses.CreateGuestRequest"
**Fix:** Make sure `responses/responses.go` has this struct:
```go
type CreateGuestRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone" binding:"required"`
	Nationality string `json:"nationality" binding:"required"`
	IDType      string `json:"id_type" binding:"required"`
	IDNumber    string `json:"id_number" binding:"required"`
}
```

### Issue: Statistics showing 0 for new guests
**Fix:** This is expected! New guests have no reservations yet. The frontend handles this with fallbacks.

---

## That's It!

Your backend will now provide complete guest details with calculated statistics and service usage. The frontend is already configured to consume this data correctly.
