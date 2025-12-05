# Guest Preference Insights - Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  guesthistory.tsx                                       │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Guest Details Modal                              │  │    │
│  │  │                                                    │  │    │
│  │  │  AI Insights Section:                             │  │    │
│  │  │  • Meal Preference: [Loading...]                  │  │    │
│  │  │  • Room Preference: [Loading...]                  │  │    │
│  │  │  • Service Pattern: [Loading...]                  │  │    │
│  │  │                                                    │  │    │
│  │  │  [Refresh Insights Button]                        │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  Calls: useGetGuestAIInsights(guestId)                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               │ HTTP GET /api/v1/guests/:id/ai-insights
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Go/Gin)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  routes/guests.go                                       │    │
│  │                                                          │    │
│  │  func GetGuestAIInsights(c *gin.Context) {             │    │
│  │    1. Check if insights exist & are recent             │    │
│  │    2. If not, call InsightsService.Generate()          │    │
│  │    3. Return insights JSON                              │    │
│  │  }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC (Services)                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  services/guest_insights.go                             │    │
│  │                                                          │    │
│  │  type GuestInsightsService struct {                     │    │
│  │    db *sql.DB                                           │    │
│  │  }                                                       │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  GenerateInsights(guestID)                        │  │    │
│  │  │  ├─> AnalyzeMealPreference()                      │  │    │
│  │  │  ├─> AnalyzeRoomPreference()                      │  │    │
│  │  │  └─> AnalyzeServicePattern()                      │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  service_requests│  │   reservations   │  │    rooms     │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤ │
│  │ • guest_id       │  │ • guest_id       │  │ • room_type  │ │
│  │ • service_type   │  │ • room_id        │  │ • floor      │ │
│  │ • description    │  │ • check_in_date  │  │ • price      │ │
│  │ • requested_at   │  │ • check_out_date │  └──────────────┘ │
│  │ • completed_at   │  │ • status         │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  guest_ai_insights (Output Table)                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • id                                                       │  │
│  │ • guest_id                                                 │  │
│  │ • meal_preference    ← Generated by analysis              │  │
│  │ • room_preference    ← Generated by analysis              │  │
│  │ • service_pattern    ← Generated by analysis              │  │
│  │ • risk_score                                               │  │
│  │ • recommendations                                          │  │
│  │ • created_at                                               │  │
│  │ • updated_at                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Analysis Flow

### 1. Meal Preference Analysis

```
service_requests (WHERE guest_id = X AND service_type = 'room-service')
    │
    ├─> Count by description → Most ordered cuisine
    ├─> AVG(HOUR(requested_at)) → Meal time pattern
    └─> COUNT(*) → Frequency classification
    │
    ▼
"Prefers Italian cuisine • Dinner person • Frequent user"
```

### 2. Room Preference Analysis

```
reservations + rooms (WHERE guest_id = X)
    │
    ├─> GROUP BY room_type → Most booked type
    ├─> AVG(floor) → Floor preference
    └─> COUNT(*) → Loyalty indicator
    │
    ▼
"Prefers Suite rooms • Higher floors • Loyal guest (12 stays)"
```

### 3. Service Pattern Analysis

```
service_requests (WHERE guest_id = X)
    │
    ├─> GROUP BY service_type → Most requested service
    ├─> COUNT(*) → Usage frequency
    └─> AVG(response_time) → Service expectations
    │
    ▼
"Most requested: housekeeping • Moderate usage • Quick service"
```

---

## Data Flow Timeline

```
Time: T0 (Guest Activity)
┌─────────────────────────────────────────┐
│ Guest orders room service (Italian)     │
│ → Saved to service_requests table       │
└─────────────────────────────────────────┘
                │
                ▼
Time: T1 (Checkout or Scheduled Job)
┌─────────────────────────────────────────┐
│ Trigger: Checkout completed             │
│ → Call InsightsService.Generate()       │
│ → Analyze all guest data                │
│ → Update guest_ai_insights table        │
└─────────────────────────────────────────┘
                │
                ▼
Time: T2 (Staff Views Guest)
┌─────────────────────────────────────────┐
│ Staff opens guest details modal         │
│ → API call to /guests/:id/ai-insights   │
│ → Return cached insights from DB        │
│ → Display in UI                          │
└─────────────────────────────────────────┘
```

---

## Caching Strategy

```
┌──────────────────────────────────────────────────────────┐
│ API Request: GET /guests/123/ai-insights                 │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │ Check guest_ai_insights table │
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌─────────────┐         ┌─────────────┐
    │ Exists &    │         │ Missing or  │
    │ Recent      │         │ Stale       │
    │ (< 7 days)  │         │ (> 7 days)  │
    └─────────────┘         └─────────────┘
            │                       │
            │                       ▼
            │               ┌─────────────────┐
            │               │ Generate Fresh  │
            │               │ Insights        │
            │               └─────────────────┘
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
                ┌───────────────┐
                │ Return JSON   │
                └───────────────┘
```

---

## Trigger Points for Insight Generation

### Automatic Triggers
1. **After Checkout**
   ```go
   func CheckoutReservation() {
       // ... checkout logic ...
       go InsightsService.Generate(guestID)
   }
   ```

2. **Nightly Batch Job**
   ```go
   func UpdateAllGuestInsights() {
       // Run at 2 AM daily
       // Update insights for guests with recent activity
   }
   ```

3. **After Service Completion**
   ```go
   func CompleteServiceRequest() {
       // ... completion logic ...
       go InsightsService.Generate(guestID)
   }
   ```

### Manual Triggers
1. **Refresh Button** (Frontend)
   ```tsx
   <button onClick={() => refreshInsights.mutate(guestId)}>
     Refresh Insights
   </button>
   ```

2. **Admin Panel** (Future)
   - Bulk regenerate insights
   - Force update for specific guests

---

## Performance Considerations

### Query Optimization
```sql
-- Add indexes for faster queries
CREATE INDEX idx_service_requests_guest_id ON service_requests(guest_id);
CREATE INDEX idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX idx_guest_ai_insights_guest_id ON guest_ai_insights(guest_id);
CREATE INDEX idx_guest_ai_insights_updated_at ON guest_ai_insights(updated_at);
```

### Caching Layers
```
┌─────────────────────────────────────────┐
│ Layer 1: Database (guest_ai_insights)  │ ← 7 day cache
├─────────────────────────────────────────┤
│ Layer 2: Redis (optional)              │ ← 1 hour cache
├─────────────────────────────────────────┤
│ Layer 3: Frontend Query Cache          │ ← 5 min cache
└─────────────────────────────────────────┘
```

### Async Processing
```go
// Don't block API response
go func() {
    InsightsService.Generate(guestID)
}()
```

---

## Error Handling

```
API Request
    │
    ├─> Insights exist? → Return immediately
    │
    ├─> Generate fails? → Return empty insights
    │                     + Log error
    │                     + Queue for retry
    │
    └─> No data? → Return "No data available"
                   + Don't retry
```

---

## Monitoring & Metrics

### Key Metrics to Track
1. **Coverage**: % of guests with insights
2. **Freshness**: Avg age of insights
3. **Generation Time**: Avg time to generate
4. **Error Rate**: Failed generations
5. **Usage**: How often insights are viewed

### Logging
```go
log.Info("Generating insights", 
    "guest_id", guestID,
    "meal_orders", mealCount,
    "bookings", bookingCount,
    "service_requests", requestCount)
```

---

## Security & Privacy

### Data Access
- Only staff with guest access can view insights
- Insights are derived, not raw data
- No PII in insight strings

### Compliance
- GDPR: Guest can request insight deletion
- Data retention: Insights expire after 1 year
- Audit log: Track who views insights

---

## Scalability

### Current (MVP)
- Synchronous generation on demand
- Database caching
- ~100 guests/day

### Future (Scale)
- Message queue (RabbitMQ/Kafka)
- Distributed processing
- Redis caching
- ~10,000 guests/day

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Worker 1 │     │ Worker 2 │     │ Worker 3 │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
                ┌─────▼─────┐
                │   Queue   │
                └───────────┘
```
