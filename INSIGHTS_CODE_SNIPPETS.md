# Guest Preference Insights - Ready-to-Use Code Snippets

## Backend Implementation

### 1. Create Service File

**File: `backend/services/guest_insights.go`**

```go
package services

import (
    "database/sql"
    "fmt"
    "strings"
)

type GuestInsightsService struct {
    db *sql.DB
}

func NewGuestInsightsService(db *sql.DB) *GuestInsightsService {
    return &GuestInsightsService{db: db}
}

// AnalyzeMealPreference generates meal preference insights
func (s *GuestInsightsService) AnalyzeMealPreference(guestID int) string {
    var insights []string
    
    // Get total order count
    var orderCount int
    err := s.db.QueryRow(`
        SELECT COUNT(*) 
        FROM service_requests 
        WHERE guest_id = $1 
        AND service_type = 'room-service'
        AND status = 'completed'
    `, guestID).Scan(&orderCount)
    
    if err != nil || orderCount == 0 {
        return "No meal order history available"
    }
    
    // Get most ordered items (top 2)
    rows, err := s.db.Query(`
        SELECT description, COUNT(*) as cnt 
        FROM service_requests 
        WHERE guest_id = $1 
        AND service_type = 'room-service'
        AND status = 'completed'
        GROUP BY description 
        ORDER BY cnt DESC 
        LIMIT 2
    `, guestID)
    
    if err == nil {
        defer rows.Close()
        cuisines := []string{}
        for rows.Next() {
            var desc string
            var cnt int
            rows.Scan(&desc, &cnt)
            if desc != "" {
                cuisines = append(cuisines, desc)
            }
        }
        if len(cuisines) > 0 {
            insights = append(insights, fmt.Sprintf("Prefers %s", strings.Join(cuisines, ", ")))
        }
    }
    
    // Get average order hour
    var avgHour float64
    err = s.db.QueryRow(`
        SELECT AVG(EXTRACT(HOUR FROM requested_at))
        FROM service_requests 
        WHERE guest_id = $1 
        AND service_type = 'room-service'
        AND status = 'completed'
    `, guestID).Scan(&avgHour)
    
    if err == nil {
        if avgHour < 11 {
            insights = append(insights, "Breakfast person")
        } else if avgHour < 15 {
            insights = append(insights, "Lunch person")
        } else {
            insights = append(insights, "Dinner person")
        }
    }
    
    // Classify frequency
    if orderCount > 10 {
        insights = append(insights, "Frequent room service user")
    } else if orderCount > 5 {
        insights = append(insights, "Occasional room service user")
    } else {
        insights = append(insights, "Rare room service user")
    }
    
    if len(insights) == 0 {
        return "Standard meal preferences"
    }
    
    return strings.Join(insights, " • ")
}

// AnalyzeRoomPreference generates room preference insights
func (s *GuestInsightsService) AnalyzeRoomPreference(guestID int) string {
    var insights []string
    
    // Get total booking count
    var bookingCount int
    err := s.db.QueryRow(`
        SELECT COUNT(*) 
        FROM reservations 
        WHERE guest_id = $1
    `, guestID).Scan(&bookingCount)
    
    if err != nil || bookingCount == 0 {
        return "No booking history available"
    }
    
    // Get most booked room type
    var roomType string
    var typeCount int
    err = s.db.QueryRow(`
        SELECT r.room_type, COUNT(*) as cnt
        FROM reservations res
        JOIN rooms r ON res.room_id = r.id
        WHERE res.guest_id = $1
        GROUP BY r.room_type
        ORDER BY cnt DESC
        LIMIT 1
    `, guestID).Scan(&roomType, &typeCount)
    
    if err == nil && typeCount > 0 {
        if typeCount > 1 {
            insights = append(insights, fmt.Sprintf("Prefers %s rooms", roomType))
        } else {
            insights = append(insights, fmt.Sprintf("Booked %s room", roomType))
        }
    }
    
    // Get average floor preference
    var avgFloor float64
    err = s.db.QueryRow(`
        SELECT AVG(r.floor)
        FROM reservations res
        JOIN rooms r ON res.room_id = r.id
        WHERE res.guest_id = $1
    `, guestID).Scan(&avgFloor)
    
    if err == nil {
        if avgFloor > 5 {
            insights = append(insights, "Prefers higher floors")
        } else if avgFloor < 3 {
            insights = append(insights, "Prefers lower floors")
        } else {
            insights = append(insights, "Mid-level floors")
        }
    }
    
    // Loyalty indicator
    if bookingCount > 5 {
        insights = append(insights, fmt.Sprintf("Loyal guest (%d stays)", bookingCount))
    } else if bookingCount > 2 {
        insights = append(insights, fmt.Sprintf("Returning guest (%d stays)", bookingCount))
    } else {
        insights = append(insights, "New guest")
    }
    
    if len(insights) == 0 {
        return "Standard room preferences"
    }
    
    return strings.Join(insights, " • ")
}

// AnalyzeServicePattern generates service pattern insights
func (s *GuestInsightsService) AnalyzeServicePattern(guestID int) string {
    var insights []string
    
    // Get total service request count
    var requestCount int
    err := s.db.QueryRow(`
        SELECT COUNT(*) 
        FROM service_requests 
        WHERE guest_id = $1
    `, guestID).Scan(&requestCount)
    
    if err != nil || requestCount == 0 {
        return "No service request history"
    }
    
    // Get most common service type
    var serviceType string
    var typeCount int
    err = s.db.QueryRow(`
        SELECT service_type, COUNT(*) as cnt
        FROM service_requests
        WHERE guest_id = $1
        GROUP BY service_type
        ORDER BY cnt DESC
        LIMIT 1
    `, guestID).Scan(&serviceType, &typeCount)
    
    if err == nil && serviceType != "" {
        insights = append(insights, fmt.Sprintf("Most requested: %s", serviceType))
    }
    
    // Classify usage frequency
    if requestCount > 20 {
        insights = append(insights, "High service usage")
    } else if requestCount > 10 {
        insights = append(insights, "Moderate service usage")
    } else if requestCount > 5 {
        insights = append(insights, "Low service usage")
    } else {
        insights = append(insights, "Minimal service usage")
    }
    
    // Check average response time expectation
    var avgResponseHours float64
    err = s.db.QueryRow(`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - requested_at))/3600)
        FROM service_requests
        WHERE guest_id = $1 
        AND completed_at IS NOT NULL
    `, guestID).Scan(&avgResponseHours)
    
    if err == nil && avgResponseHours > 0 {
        if avgResponseHours < 1 {
            insights = append(insights, "Expects quick service")
        } else if avgResponseHours < 3 {
            insights = append(insights, "Standard service expectations")
        }
    }
    
    if len(insights) == 0 {
        return "Standard service pattern"
    }
    
    return strings.Join(insights, " • ")
}

// GenerateInsights creates or updates all insights for a guest
func (s *GuestInsightsService) GenerateInsights(guestID int) error {
    mealPref := s.AnalyzeMealPreference(guestID)
    roomPref := s.AnalyzeRoomPreference(guestID)
    servicePat := s.AnalyzeServicePattern(guestID)
    
    // Upsert into guest_ai_insights table
    query := `
        INSERT INTO guest_ai_insights 
        (guest_id, meal_preference, room_preference, service_pattern, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (guest_id) 
        DO UPDATE SET 
            meal_preference = $2,
            room_preference = $3,
            service_pattern = $4,
            updated_at = NOW()
    `
    
    _, err := s.db.Exec(query, guestID, mealPref, roomPref, servicePat)
    return err
}
```

---

### 2. Update API Route

**File: `backend/routes/guests.go`**

Add this function:

```go
import (
    "your-project/services"
    "time"
)

// GetGuestAIInsights returns AI-generated insights for a guest
func GetGuestAIInsights(c *gin.Context) {
    guestIDStr := c.Param("id")
    guestID, err := strconv.Atoi(guestIDStr)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid guest ID"})
        return
    }
    
    // Check if insights exist and are recent (< 7 days old)
    var insights struct {
        ID              int       `json:"id"`
        GuestID         int       `json:"guest_id"`
        MealPreference  string    `json:"meal_preference"`
        RoomPreference  string    `json:"room_preference"`
        ServicePattern  string    `json:"service_pattern"`
        RiskScore       string    `json:"risk_score"`
        Recommendations []string  `json:"recommendations"`
        Complaints      []string  `json:"complaints"`
        CreatedAt       time.Time `json:"created_at"`
        UpdatedAt       time.Time `json:"updated_at"`
    }
    
    err = db.QueryRow(`
        SELECT id, guest_id, meal_preference, room_preference, service_pattern,
               risk_score, recommendations, complaints, created_at, updated_at
        FROM guest_ai_insights 
        WHERE guest_id = $1 
        AND updated_at > NOW() - INTERVAL '7 days'
    `, guestID).Scan(
        &insights.ID,
        &insights.GuestID,
        &insights.MealPreference,
        &insights.RoomPreference,
        &insights.ServicePattern,
        &insights.RiskScore,
        &insights.Recommendations,
        &insights.Complaints,
        &insights.CreatedAt,
        &insights.UpdatedAt,
    )
    
    if err == sql.ErrNoRows {
        // Generate new insights
        insightsService := services.NewGuestInsightsService(db)
        err = insightsService.GenerateInsights(guestID)
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to generate insights"})
            return
        }
        
        // Fetch newly generated insights
        err = db.QueryRow(`
            SELECT id, guest_id, meal_preference, room_preference, service_pattern,
                   risk_score, recommendations, complaints, created_at, updated_at
            FROM guest_ai_insights 
            WHERE guest_id = $1
        `, guestID).Scan(
            &insights.ID,
            &insights.GuestID,
            &insights.MealPreference,
            &insights.RoomPreference,
            &insights.ServicePattern,
            &insights.RiskScore,
            &insights.Recommendations,
            &insights.Complaints,
            &insights.CreatedAt,
            &insights.UpdatedAt,
        )
        
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to fetch generated insights"})
            return
        }
    } else if err != nil {
        c.JSON(500, gin.H{"error": "Database error"})
        return
    }
    
    c.JSON(200, gin.H{
        "status": "OK",
        "data":   insights,
    })
}
```

Register the route:

```go
// In your router setup
guestRoutes := router.Group("/guests")
{
    guestRoutes.GET("/:id/ai-insights", GetGuestAIInsights)
    // ... other routes
}
```

---

### 3. Add Refresh Endpoint (Optional)

```go
// RefreshGuestAIInsights forces regeneration of insights
func RefreshGuestAIInsights(c *gin.Context) {
    guestIDStr := c.Param("id")
    guestID, err := strconv.Atoi(guestIDStr)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid guest ID"})
        return
    }
    
    insightsService := services.NewGuestInsightsService(db)
    err = insightsService.GenerateInsights(guestID)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to generate insights"})
        return
    }
    
    c.JSON(200, gin.H{
        "status":  "OK",
        "message": "Insights refreshed successfully",
    })
}
```

Register:
```go
guestRoutes.POST("/:id/ai-insights/refresh", RefreshGuestAIInsights)
```

---

### 4. Add Automatic Trigger on Checkout

**File: `backend/routes/reservations.go`**

In your checkout function, add:

```go
func CheckoutReservation(c *gin.Context) {
    // ... existing checkout logic ...
    
    // After successful checkout, trigger insight generation
    go func(guestID int) {
        insightsService := services.NewGuestInsightsService(db)
        err := insightsService.GenerateInsights(guestID)
        if err != nil {
            log.Printf("Failed to generate insights for guest %d: %v", guestID, err)
        }
    }(reservation.GuestID)
    
    c.JSON(200, gin.H{
        "status":  "OK",
        "message": "Checkout successful",
    })
}
```

---

### 5. Database Migration (if needed)

```sql
-- Ensure guest_ai_insights table exists
CREATE TABLE IF NOT EXISTS guest_ai_insights (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES guests(id) ON DELETE CASCADE,
    meal_preference TEXT DEFAULT '',
    room_preference TEXT DEFAULT '',
    service_pattern TEXT DEFAULT '',
    risk_score VARCHAR(10) DEFAULT 'low',
    recommendations TEXT[] DEFAULT '{}',
    complaints TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(guest_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_ai_insights_guest_id 
    ON guest_ai_insights(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_ai_insights_updated_at 
    ON guest_ai_insights(updated_at);

-- Add indexes on source tables
CREATE INDEX IF NOT EXISTS idx_service_requests_guest_service 
    ON service_requests(guest_id, service_type);
CREATE INDEX IF NOT EXISTS idx_reservations_guest 
    ON reservations(guest_id);
```

---

## Frontend Enhancements

### 1. Add Refresh Button

**File: `pages/guesthistory.tsx`**

```tsx
import { RefreshCw, Utensils, Home, Activity } from 'lucide-react';

// Inside the component
const queryClient = useQueryClient();

const refreshInsights = useMutation({
  mutationFn: async (guestId: number) => {
    await axios.post(`/guests/${guestId}/ai-insights/refresh`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ 
      queryKey: ['guests', selectedGuest.id, 'ai-insights'] 
    });
    toast.success('Insights refreshed!');
  },
  onError: () => {
    toast.error('Failed to refresh insights');
  },
});

// In the JSX
<div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
  <button
    onClick={() => refreshInsights.mutate(selectedGuest.id)}
    disabled={refreshInsights.isPending}
    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
  >
    <RefreshCw className={`w-4 h-4 ${refreshInsights.isPending ? 'animate-spin' : ''}`} />
    Refresh
  </button>
</div>
```

### 2. Enhanced Display with Icons

```tsx
<div className="space-y-4">
  <div className="flex items-start">
    <Utensils className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700 mb-1">Meal Preference</p>
      <p className="text-sm text-gray-600">
        {selectedGuest.ai_insights?.meal_preference || (
          <span className="italic text-gray-400">Analyzing meal patterns...</span>
        )}
      </p>
    </div>
  </div>

  <div className="flex items-start">
    <Home className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700 mb-1">Room Preference</p>
      <p className="text-sm text-gray-600">
        {selectedGuest.ai_insights?.room_preference || (
          <span className="italic text-gray-400">Analyzing room history...</span>
        )}
      </p>
    </div>
  </div>

  <div className="flex items-start">
    <Activity className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700 mb-1">Service Pattern</p>
      <p className="text-sm text-gray-600">
        {selectedGuest.ai_insights?.service_pattern || (
          <span className="italic text-gray-400">Analyzing service usage...</span>
        )}
      </p>
    </div>
  </div>
</div>
```

---

## Testing

### 1. Test with Sample Data

```bash
# Create a test guest
curl -X POST http://localhost:8080/api/v1/guests -d '{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "nationality": "US",
  "id_type": "passport",
  "id_number": "P123456"
}'

# Add some service requests
curl -X POST http://localhost:8080/api/v1/service-requests -d '{
  "guest_id": 1,
  "service_type": "room-service",
  "description": "Italian pasta",
  "status": "completed"
}'

# Add a reservation
curl -X POST http://localhost:8080/api/v1/reservations -d '{
  "guest_id": 1,
  "room_id": 5,
  "check_in_date": "2024-12-01",
  "check_out_date": "2024-12-05"
}'

# Generate insights
curl http://localhost:8080/api/v1/guests/1/ai-insights
```

### 2. Expected Response

```json
{
  "status": "OK",
  "data": {
    "id": 1,
    "guest_id": 1,
    "meal_preference": "Prefers Italian pasta • Dinner person • Rare room service user",
    "room_preference": "Booked Suite room • Mid-level floors • New guest",
    "service_pattern": "Most requested: room-service • Minimal service usage",
    "risk_score": "low",
    "recommendations": [],
    "complaints": [],
    "created_at": "2024-12-05T10:00:00Z",
    "updated_at": "2024-12-05T10:00:00Z"
  }
}
```

---

## Deployment Checklist

- [ ] Create `services/guest_insights.go`
- [ ] Update `routes/guests.go` with new endpoints
- [ ] Run database migration
- [ ] Add indexes to database
- [ ] Test with sample data
- [ ] Update frontend with refresh button
- [ ] Add automatic trigger on checkout
- [ ] Monitor logs for errors
- [ ] Test in staging environment
- [ ] Deploy to production
