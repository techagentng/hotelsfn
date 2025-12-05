# Guest Detail Modal Fix

## Problem
When clicking "View More" on a guest, the application crashed with:
```
Cannot read properties of undefined (reading 'totalStays')
```

## Root Cause
The guest detail modal was trying to access nested properties that don't exist in the API response without safe navigation. The backend API returns:

```json
{
  "id": 1,
  "name": "John Doe",
  "reservations": [],
  "preferences": {
    "room_floors": [],
    "meal_types": [],
    "room_types": [],
    "special_requests": []
  },
  "ai_insights": {
    "meal_preference": "",
    "room_preference": "",
    "service_pattern": "",
    "risk_score": "low",
    "recommendations": [],
    "complaints": []
  }
}
```

But the code was:
1. Accessing `statistics` object which doesn't exist
2. Using camelCase property names instead of snake_case
3. Not checking if properties exist before accessing them

## Changes Made

### 1. Statistics Section (Lines 762-780)
**Before:**
```typescript
<p>{selectedGuest.statistics.totalStays}</p>
```

**After:**
```typescript
<p>{selectedGuest.statistics?.totalStays || selectedGuest.reservations?.length || 0}</p>
```

- Added optional chaining (`?.`)
- Fallback to reservation count or 0
- All statistics fields now have safe defaults

### 2. Reservations Section (Lines 782-817)
**Before:**
```typescript
{selectedGuest.reservations.map(...)}
```

**After:**
```typescript
{(selectedGuest.reservations && selectedGuest.reservations.length > 0) 
  ? selectedGuest.reservations.map(...) 
  : <EmptyState />
}
```

- Added existence check
- Shows "No reservations found" when empty

### 3. Preferences Section (Lines 819-863)
**Before:**
```typescript
{selectedGuest.preferences.roomFloor.map(...)}
```

**After:**
```typescript
{(selectedGuest.preferences?.room_floors && selectedGuest.preferences.room_floors.length > 0)
  ? selectedGuest.preferences.room_floors.map(...)
  : <span>No preference set</span>
}
```

- Fixed property names: `roomFloor` → `room_floors`, `mealType` → `meal_types`, etc.
- Added safe navigation
- Shows "No preference set" when empty

### 4. Service Usage Section (Lines 865-880)
**Before:**
```typescript
{selectedGuest.service_usage.map(...)}
```

**After:**
```typescript
{(selectedGuest.service_usage && selectedGuest.service_usage.length > 0)
  ? selectedGuest.service_usage.map(...)
  : <EmptyState />
}
```

- Added existence check
- Shows "No service usage data available" when empty

### 5. AI Insights Section (Lines 890-913)
**Before:**
```typescript
<p>{selectedGuest.ai_insights.mealPreference}</p>
<p>{selectedGuest.ai_insights.roomPreference}</p>
<p>{selectedGuest.ai_insights.servicePattern}</p>
<span>{selectedGuest.ai_insights.riskScore}</span>
```

**After:**
```typescript
<p>{selectedGuest.ai_insights?.meal_preference || 'No data available'}</p>
<p>{selectedGuest.ai_insights?.room_preference || 'No data available'}</p>
<p>{selectedGuest.ai_insights?.service_pattern || 'No data available'}</p>
<span>{selectedGuest.ai_insights?.risk_score || 'low'}</span>
```

- Fixed property names to snake_case
- Added safe navigation
- Fallback to 'No data available' or 'low'

### 6. Recommendations & Complaints (Lines 916-943)
**Before:**
```typescript
{selectedGuest.ai_insights.recommendations.length > 0 && (...)}
{selectedGuest.ai_insights.complaints.length > 0 && (...)}
```

**After:**
```typescript
{selectedGuest.ai_insights?.recommendations && selectedGuest.ai_insights.recommendations.length > 0 && (...)}
{selectedGuest.ai_insights?.complaints && selectedGuest.ai_insights.complaints.length > 0 && (...)}
```

- Added safe navigation before checking length
- Prevents errors when properties don't exist

## Property Name Mapping

### Backend (snake_case) → Frontend Display

**Preferences:**
- `room_floors` (was `roomFloor`)
- `meal_types` (was `mealType`)
- `room_types` (was `roomType`)
- `special_requests` (was `specialRequests`)

**AI Insights:**
- `meal_preference` (was `mealPreference`)
- `room_preference` (was `roomPreference`)
- `service_pattern` (was `servicePattern`)
- `risk_score` (was `riskScore`)

**Other:**
- `service_usage` (already correct)

## Testing

### Test 1: View New Guest (No Data)
1. Create a new guest
2. Click "View More"
3. **Expected:** Modal opens showing:
   - Statistics: All show 0 or N/A
   - Reservations: "No reservations found"
   - Preferences: "No preference set" for all
   - Service Usage: "No service usage data available"
   - AI Insights: "No data available" for all fields
   - Risk Score: "Low"

### Test 2: View Guest with Data
1. Click on a guest with existing reservations
2. **Expected:** Modal shows actual data without errors

### Test 3: Empty Arrays
1. Guest with empty arrays for preferences
2. **Expected:** Shows "No preference set" messages

## Summary

All unsafe property accesses have been fixed with:
- ✅ Optional chaining (`?.`)
- ✅ Fallback values
- ✅ Correct snake_case property names
- ✅ Empty state handling
- ✅ Existence checks before `.map()` or `.length`

The modal will now gracefully handle:
- Missing `statistics` object
- Empty arrays
- Undefined nested properties
- New guests with no history
