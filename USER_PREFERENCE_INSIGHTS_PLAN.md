# User Preference Insights Implementation Plan

## Current Status
The frontend already has the data structures and API hooks in place for guest AI insights:
- ✅ `GuestAIInsights` interface defined
- ✅ `useGetGuestAIInsights(id)` hook available
- ✅ UI displaying insights in `guesthistory.tsx`
- ❌ Backend not returning data (showing "No data available")

## Problem
Three key insights are not being populated:
1. **Meal Preference** - No data available
2. **Room Preference** - No data available  
3. **Service Pattern** - No data available

## Solution Overview
We need to implement a data collection and analysis system that:
1. Collects guest behavior data from various sources
2. Analyzes patterns using business logic or AI
3. Stores insights in the database
4. Returns insights via the API

---

## Implementation Plan

### Phase 1: Data Collection Strategy

#### 1.1 Identify Data Sources

**For Meal Preference:**
- Room service orders (from `service_requests` table where `service_type = 'room-service'`)
- Order history from room service menu
- Time of day patterns (breakfast, lunch, dinner)
- Cuisine types ordered
- Dietary restrictions mentioned

**For Room Preference:**
- Historical room bookings (from `reservations` table)
- Room types selected (suite, deluxe, standard)
- Floor preferences
- View preferences (if tracked)
- Room features used (balcony, king bed, etc.)

**For Service Pattern:**
- Service request frequency (from `service_requests` table)
- Types of services requested (housekeeping, maintenance, concierge)
- Request timing patterns
- Response to service quality
- Special requests frequency

#### 1.2 Database Schema Review

Current `guest_ai_insights` table should have:
```sql
CREATE TABLE guest_ai_insights (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER REFERENCES guests(id),
    meal_preference TEXT,
    room_preference TEXT,
    service_pattern TEXT,
    risk_score VARCHAR(10),
    recommendations TEXT[],
    complaints TEXT[],
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

### Phase 2: Backend Implementation

#### 2.1 Create Analysis Service

**File: `backend/services/guest_insights.go`**

```go
package services

type GuestInsightsService struct {
    db *sql.DB
}

// Analyze meal preferences based on order history
func (s *GuestInsightsService) AnalyzeMealPreference(guestID int) string {
    // Query room service orders
    // Count cuisine types
    // Identify most common meal times
    // Return formatted preference string
    
    // Example output:
    // "Prefers Italian cuisine, typically orders dinner between 7-9 PM"
    // "Vegetarian options, breakfast person (orders 70% breakfast items)"
    // "Frequent room service user, prefers light meals"
}

// Analyze room preferences based on booking history
func (s *GuestInsightsService) AnalyzeRoomPreference(guestID int) string {
    // Query past reservations
    // Identify room type patterns
    // Check floor preferences
    // Return formatted preference string
    
    // Example output:
    // "Prefers higher floors (8+), Suite rooms"
    // "Consistently books Deluxe rooms with king beds"
    // "Prefers quiet rooms away from elevator"
}

// Analyze service patterns
func (s *GuestInsightsService) AnalyzeServicePattern(guestID int) string {
    // Query service requests
    // Calculate request frequency
    // Identify common request types
    // Return formatted pattern string
    
    // Example output:
    // "Low maintenance guest, minimal service requests"
    // "Frequent housekeeping requests, prefers daily service"
    // "Tech-savvy, uses in-room tablet for most requests"
}

// Generate or update insights for a guest
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

#### 2.2 Create Analysis Queries

**Meal Preference Query:**
```sql
-- Get most ordered cuisine types
SELECT 
    description,
    COUNT(*) as order_count,
    AVG(EXTRACT(HOUR FROM requested_at)) as avg_order_hour
FROM service_requests
WHERE guest_id = $1 
    AND service_type = 'room-service'
    AND status = 'completed'
GROUP BY description
ORDER BY order_count DESC
LIMIT 5;
```

**Room Preference Query:**
```sql
-- Get room booking patterns
SELECT 
    r.room_type,
    r.floor,
    COUNT(*) as booking_count,
    AVG(res.nights) as avg_stay_duration
FROM reservations res
JOIN rooms r ON res.room_id = r.id
WHERE res.guest_id = $1
GROUP BY r.room_type, r.floor
ORDER BY booking_count DESC;
```

**Service Pattern Query:**
```sql
-- Get service request patterns
SELECT 
    service_type,
    COUNT(*) as request_count,
    AVG(EXTRACT(EPOCH FROM (completed_at - requested_at))/3600) as avg_response_hours
FROM service_requests
WHERE guest_id = $1
GROUP BY service_type
ORDER BY request_count DESC;
```

#### 2.3 Update API Endpoint

**File: `backend/routes/guests.go`**

```go
// GET /api/v1/guests/:id/ai-insights
func GetGuestAIInsights(c *gin.Context) {
    guestID := c.Param("id")
    
    // Check if insights exist and are recent (< 7 days old)
    var insights GuestAIInsights
    err := db.QueryRow(`
        SELECT * FROM guest_ai_insights 
        WHERE guest_id = $1 
        AND updated_at > NOW() - INTERVAL '7 days'
    `, guestID).Scan(&insights)
    
    if err == sql.ErrNoRows {
        // Generate new insights
        insightsService := services.NewGuestInsightsService(db)
        err = insightsService.GenerateInsights(guestID)
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to generate insights"})
            return
        }
        
        // Fetch newly generated insights
        db.QueryRow(`SELECT * FROM guest_ai_insights WHERE guest_id = $1`, guestID).Scan(&insights)
    }
    
    c.JSON(200, gin.H{
        "status": "OK",
        "data": insights,
    })
}
```

---

### Phase 3: Insight Generation Logic

#### 3.1 Meal Preference Algorithm

```go
func (s *GuestInsightsService) AnalyzeMealPreference(guestID int) string {
    var insights []string
    
    // 1. Get order frequency
    var orderCount int
    db.QueryRow(`
        SELECT COUNT(*) FROM service_requests 
        WHERE guest_id = $1 AND service_type = 'room-service'
    `, guestID).Scan(&orderCount)
    
    if orderCount == 0 {
        return "No meal order history available"
    }
    
    // 2. Identify cuisine preferences
    rows, _ := db.Query(`
        SELECT description, COUNT(*) as cnt 
        FROM service_requests 
        WHERE guest_id = $1 AND service_type = 'room-service'
        GROUP BY description 
        ORDER BY cnt DESC LIMIT 3
    `, guestID)
    
    cuisines := []string{}
    for rows.Next() {
        var desc string
        var cnt int
        rows.Scan(&desc, &cnt)
        cuisines = append(cuisines, desc)
    }
    
    if len(cuisines) > 0 {
        insights = append(insights, fmt.Sprintf("Prefers %s", strings.Join(cuisines, ", ")))
    }
    
    // 3. Identify meal time patterns
    var avgHour float64
    db.QueryRow(`
        SELECT AVG(EXTRACT(HOUR FROM requested_at))
        FROM service_requests 
        WHERE guest_id = $1 AND service_type = 'room-service'
    `, guestID).Scan(&avgHour)
    
    if avgHour < 11 {
        insights = append(insights, "Breakfast person")
    } else if avgHour < 15 {
        insights = append(insights, "Lunch person")
    } else {
        insights = append(insights, "Dinner person")
    }
    
    // 4. Order frequency classification
    if orderCount > 10 {
        insights = append(insights, "Frequent room service user")
    } else if orderCount > 5 {
        insights = append(insights, "Occasional room service user")
    } else {
        insights = append(insights, "Rare room service user")
    }
    
    return strings.Join(insights, " • ")
}
```

#### 3.2 Room Preference Algorithm

```go
func (s *GuestInsightsService) AnalyzeRoomPreference(guestID int) string {
    var insights []string
    
    // 1. Get booking count
    var bookingCount int
    db.QueryRow(`
        SELECT COUNT(*) FROM reservations WHERE guest_id = $1
    `, guestID).Scan(&bookingCount)
    
    if bookingCount == 0 {
        return "No booking history available"
    }
    
    // 2. Most booked room type
    var roomType string
    var typeCount int
    db.QueryRow(`
        SELECT r.room_type, COUNT(*) as cnt
        FROM reservations res
        JOIN rooms r ON res.room_id = r.id
        WHERE res.guest_id = $1
        GROUP BY r.room_type
        ORDER BY cnt DESC
        LIMIT 1
    `, guestID).Scan(&roomType, &typeCount)
    
    if typeCount > 1 {
        insights = append(insights, fmt.Sprintf("Prefers %s rooms", roomType))
    }
    
    // 3. Floor preference
    var avgFloor float64
    db.QueryRow(`
        SELECT AVG(r.floor)
        FROM reservations res
        JOIN rooms r ON res.room_id = r.id
        WHERE res.guest_id = $1
    `, guestID).Scan(&avgFloor)
    
    if avgFloor > 5 {
        insights = append(insights, "Prefers higher floors")
    } else if avgFloor < 3 {
        insights = append(insights, "Prefers lower floors")
    }
    
    // 4. Loyalty indicator
    if bookingCount > 5 {
        insights = append(insights, fmt.Sprintf("Loyal guest (%d stays)", bookingCount))
    }
    
    if len(insights) == 0 {
        return "Standard room preferences"
    }
    
    return strings.Join(insights, " • ")
}
```

#### 3.3 Service Pattern Algorithm

```go
func (s *GuestInsightsService) AnalyzeServicePattern(guestID int) string {
    var insights []string
    
    // 1. Get total service requests
    var requestCount int
    db.QueryRow(`
        SELECT COUNT(*) FROM service_requests WHERE guest_id = $1
    `, guestID).Scan(&requestCount)
    
    if requestCount == 0 {
        return "No service request history"
    }
    
    // 2. Most common service type
    var serviceType string
    var typeCount int
    db.QueryRow(`
        SELECT service_type, COUNT(*) as cnt
        FROM service_requests
        WHERE guest_id = $1
        GROUP BY service_type
        ORDER BY cnt DESC
        LIMIT 1
    `, guestID).Scan(&serviceType, &typeCount)
    
    insights = append(insights, fmt.Sprintf("Most requested: %s", serviceType))
    
    // 3. Request frequency classification
    if requestCount > 20 {
        insights = append(insights, "High service usage")
    } else if requestCount > 10 {
        insights = append(insights, "Moderate service usage")
    } else {
        insights = append(insights, "Low service usage")
    }
    
    // 4. Response time satisfaction
    var avgResponseHours float64
    db.QueryRow(`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - requested_at))/3600)
        FROM service_requests
        WHERE guest_id = $1 AND completed_at IS NOT NULL
    `, guestID).Scan(&avgResponseHours)
    
    if avgResponseHours < 1 {
        insights = append(insights, "Expects quick service")
    }
    
    return strings.Join(insights, " • ")
}
```

---

### Phase 4: Automation & Optimization

#### 4.1 Scheduled Insight Generation

Create a background job to periodically update insights:

```go
// Run nightly to update insights for active guests
func UpdateGuestInsightsJob() {
    // Get guests with recent activity (last 30 days)
    rows, _ := db.Query(`
        SELECT DISTINCT guest_id 
        FROM reservations 
        WHERE check_out_date > NOW() - INTERVAL '30 days'
    `)
    
    insightsService := services.NewGuestInsightsService(db)
    
    for rows.Next() {
        var guestID int
        rows.Scan(&guestID)
        
        // Generate insights asynchronously
        go insightsService.GenerateInsights(guestID)
    }
}
```

#### 4.2 Real-time Updates

Trigger insight regeneration on key events:
- After checkout (update all insights)
- After room service order (update meal preference)
- After service request completion (update service pattern)

```go
// In checkout handler
func CheckoutReservation(c *gin.Context) {
    // ... existing checkout logic ...
    
    // Trigger insight update
    go func() {
        insightsService := services.NewGuestInsightsService(db)
        insightsService.GenerateInsights(guestID)
    }()
}
```

---

### Phase 5: Frontend Enhancements

#### 5.1 Loading States

Update `guesthistory.tsx` to show loading state:

```tsx
const { data: aiInsights, isLoading: insightsLoading } = useGetGuestAIInsights(selectedGuest.id);

{insightsLoading ? (
  <div className="flex items-center justify-center py-4">
    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    <span className="ml-2 text-sm text-gray-600">Analyzing preferences...</span>
  </div>
) : (
  <div className="space-y-4">
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Meal Preference</p>
      <p className="text-sm text-gray-600">
        {aiInsights?.meal_preference || 'No data available'}
      </p>
    </div>
    {/* ... other insights ... */}
  </div>
)}
```

#### 5.2 Refresh Button

Add ability to manually refresh insights:

```tsx
const refreshInsights = useMutation({
  mutationFn: async (guestId: number) => {
    await axios.post(`/guests/${guestId}/ai-insights/refresh`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: guestKeys.aiInsights(selectedGuest.id) });
    toast.success('Insights refreshed!');
  },
});

<button
  onClick={() => refreshInsights.mutate(selectedGuest.id)}
  className="text-sm text-indigo-600 hover:text-indigo-700"
>
  <RefreshCw className="w-4 h-4 inline mr-1" />
  Refresh Insights
</button>
```

#### 5.3 Visual Enhancements

Add icons and better formatting:

```tsx
<div className="space-y-4">
  <div className="flex items-start">
    <Utensils className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700 mb-1">Meal Preference</p>
      <p className="text-sm text-gray-600">
        {aiInsights?.meal_preference || (
          <span className="italic text-gray-400">No data available yet</span>
        )}
      </p>
    </div>
  </div>
  
  <div className="flex items-start">
    <Home className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700 mb-1">Room Preference</p>
      <p className="text-sm text-gray-600">
        {aiInsights?.room_preference || (
          <span className="italic text-gray-400">No data available yet</span>
        )}
      </p>
    </div>
  </div>
  
  <div className="flex items-start">
    <Activity className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-700 mb-1">Service Pattern</p>
      <p className="text-sm text-gray-600">
        {aiInsights?.service_pattern || (
          <span className="italic text-gray-400">No data available yet</span>
        )}
      </p>
    </div>
  </div>
</div>
```

---

### Phase 6: Testing Strategy

#### 6.1 Unit Tests

Test each analysis function:
```go
func TestAnalyzeMealPreference(t *testing.T) {
    // Test with no orders
    // Test with breakfast orders
    // Test with dinner orders
    // Test with mixed orders
}
```

#### 6.2 Integration Tests

Test the full flow:
1. Create guest
2. Add reservations
3. Add service requests
4. Generate insights
5. Verify insights are correct

#### 6.3 Manual Testing Checklist

- [ ] Guest with no history shows "No data available"
- [ ] Guest with 1 booking shows basic preferences
- [ ] Guest with multiple bookings shows detailed patterns
- [ ] Insights update after new activity
- [ ] Loading states work correctly
- [ ] Error states handled gracefully

---

## Implementation Timeline

### Week 1: Backend Foundation
- Day 1-2: Create `guest_insights.go` service
- Day 3-4: Implement analysis algorithms
- Day 5: Add API endpoint updates

### Week 2: Data & Testing
- Day 1-2: Write SQL queries and optimize
- Day 3-4: Unit and integration tests
- Day 5: Performance testing

### Week 3: Automation & Frontend
- Day 1-2: Implement background jobs
- Day 3-4: Frontend enhancements
- Day 5: End-to-end testing

### Week 4: Polish & Deploy
- Day 1-2: Bug fixes and refinements
- Day 3: Documentation
- Day 4: Staging deployment
- Day 5: Production deployment

---

## Success Metrics

1. **Data Coverage**: 80%+ of guests with activity have insights
2. **Accuracy**: Insights match manual review 90%+ of the time
3. **Performance**: Insight generation < 2 seconds
4. **User Satisfaction**: Staff find insights helpful

---

## Future Enhancements

1. **Machine Learning**: Use ML models for more sophisticated pattern recognition
2. **Predictive Analytics**: Predict future preferences
3. **Sentiment Analysis**: Analyze feedback and reviews
4. **Personalized Recommendations**: Suggest rooms/services based on insights
5. **Trend Analysis**: Track how preferences change over time

---

## Notes

- Start with simple rule-based logic, can enhance with ML later
- Ensure GDPR compliance for data analysis
- Cache insights to avoid recalculating on every request
- Consider privacy settings for sensitive insights
