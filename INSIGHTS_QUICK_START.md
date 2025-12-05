# Guest Preference Insights - Quick Start Guide

## Problem
Guest AI insights showing "No data available" for:
- Meal Preference
- Room Preference  
- Service Pattern

## Root Cause
Backend is not analyzing guest data to generate these insights.

## Solution Summary

### What We Have ✅
- Frontend UI displaying insights
- API hooks (`useGetGuestAIInsights`)
- Database table (`guest_ai_insights`)
- Data structures defined

### What We Need ❌
- Backend service to analyze guest behavior
- Algorithms to generate insights from data
- Automated insight generation

---

## Quick Implementation Steps

### Step 1: Create Analysis Service (Backend)
```go
// backend/services/guest_insights.go
func AnalyzeMealPreference(guestID int) string {
    // Query room service orders
    // Return: "Prefers Italian, dinner person, frequent user"
}

func AnalyzeRoomPreference(guestID int) string {
    // Query past reservations
    // Return: "Prefers Suite rooms, higher floors"
}

func AnalyzeServicePattern(guestID int) string {
    // Query service requests
    // Return: "Low maintenance, minimal requests"
}
```

### Step 2: Update API Endpoint
```go
// GET /api/v1/guests/:id/ai-insights
func GetGuestAIInsights(c *gin.Context) {
    // Check if insights exist and are recent
    // If not, generate new insights
    // Return insights
}
```

### Step 3: Test
```bash
# Create test data
curl -X POST /api/v1/service-requests -d '{
  "guest_id": 1,
  "service_type": "room-service",
  "description": "Italian pasta"
}'

# Generate insights
curl /api/v1/guests/1/ai-insights

# Should return:
{
  "meal_preference": "Prefers Italian cuisine",
  "room_preference": "Prefers Suite rooms",
  "service_pattern": "Moderate service usage"
}
```

---

## Data Sources

### For Meal Preference
- `service_requests` table where `service_type = 'room-service'`
- Count cuisine types, meal times, frequency

### For Room Preference
- `reservations` + `rooms` tables
- Analyze room types, floors, booking patterns

### For Service Pattern
- `service_requests` table
- Count request types, frequency, timing

---

## Example Outputs

### Good Insights
✅ "Prefers Italian cuisine • Dinner person • Frequent room service user"
✅ "Prefers Suite rooms • Higher floors (8+) • Loyal guest (12 stays)"
✅ "Most requested: housekeeping • Moderate service usage • Expects quick service"

### When No Data
❌ "No meal order history available"
❌ "No booking history available"  
❌ "No service request history"

---

## Priority Order

1. **High Priority**: Implement basic analysis algorithms
2. **Medium Priority**: Add automated background jobs
3. **Low Priority**: Add ML/AI enhancements

---

## Time Estimate

- **Minimum Viable**: 2-3 days (basic algorithms)
- **Full Implementation**: 2-3 weeks (with automation)
- **Advanced Features**: 1-2 months (with ML)

---

## Next Steps

1. Review full plan: `USER_PREFERENCE_INSIGHTS_PLAN.md`
2. Create backend service file
3. Implement analysis algorithms
4. Update API endpoint
5. Test with real data
6. Deploy to staging

---

## Questions to Answer

- [ ] Do we have enough historical data for meaningful insights?
- [ ] Should insights update in real-time or batch?
- [ ] Do we need ML or are rules sufficient?
- [ ] What's the minimum data threshold for showing insights?
- [ ] Should we show confidence scores?

---

## Resources

- Full Plan: `USER_PREFERENCE_INSIGHTS_PLAN.md`
- Frontend Hook: `hooks/useGuests.ts` (line 166)
- Frontend Display: `pages/guesthistory.tsx` (line 890)
- Backend Endpoint: `backend/routes/guests.go` (to be updated)
