# Staff Portal Task List Fix

## Problem
Tasks were not showing in the staff portal even though the staff API was working correctly.

## Root Cause
The code was using a custom `useGetAssignedTasks` hook that tried to fetch from `/service-requests/assigned` endpoint, but this endpoint might not exist or might be returning data in an unexpected format.

## Solution
Replaced the custom hook with the existing `useGetServiceRequests` hook from `/hooks/useRoomService.ts` which:
- Uses the standard `/service-requests` endpoint
- Already has proper error handling
- Returns data in the expected format

## Changes Made

### 1. Removed Custom Hook
Deleted the `useGetAssignedTasks` hook that was trying to fetch from `/service-requests/assigned`

### 2. Added Data Mapper
Created `mapServiceRequestToAssignedTask` function to transform ServiceRequest data to AssignedTask format:
- Maps all required fields
- Handles missing data gracefully
- Extracts room and guest information
- Generates request numbers if missing

### 3. Used Existing Hook
Now using `useGetServiceRequests()` which fetches from `/service-requests` endpoint

### 4. Enhanced Logging
Added comprehensive console logging to debug:
- Raw API response
- Data type checking
- Array length
- Processing steps
- Mapped results

### 5. Added Debug Button
UI now has a "Debug Info" button that logs:
- Staff ID
- Raw service requests data
- Loading state
- Error state
- Mapped tasks
- Task counts by status

## How to Test

### Step 1: Open the Staff Portal
Navigate to: `http://localhost:3000/staff-portal`

### Step 2: Check Console
Open browser DevTools (F12) → Console tab

You should see:
```
=== SERVICE REQUESTS DEBUG ===
Raw service requests data: [...]
Is Loading: false
Error: null
Data type: Array
Number of requests: X
============================
Processing requests: X
```

### Step 3: Click Debug Button
Click the "Debug Info" button in the tasks section header

### Step 4: Check Network Tab
Go to Network tab → Look for `/service-requests` request
- Should return 200 OK
- Should have data in response

## Expected API Response

The `/service-requests` endpoint should return:
```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "service_type": "housekeeping",
        "status": "pending",
        "priority": "normal",
        "description": "Clean room",
        "room_number": "201",
        "guest_name": "John Doe",
        "assigned_to": "Maria Garcia",
        "assigned_staff_id": 1,
        "created_at": "2024-12-05T09:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

## What Happens Now

1. **On Page Load**: 
   - Fetches all service requests from `/service-requests`
   - Logs raw data to console
   - Maps data to internal format
   - Displays tasks in UI

2. **If No Tasks**:
   - Shows "No tasks assigned" message
   - Console will show: `Number of requests: 0`

3. **If API Fails**:
   - Shows error message with details
   - Console will show error information
   - Error message displayed in UI

4. **If Tasks Exist**:
   - Tasks displayed in list
   - Grouped by status (assigned, in progress, completed)
   - Shows task counts in stats cards

## Troubleshooting

### Issue: Still No Tasks Showing

**Check Console For**:
1. `Number of requests: 0` → No tasks in database
2. `Error: ...` → API error, check backend
3. `Data type: undefined` → API not returning data

**Check Network Tab**:
1. Is `/service-requests` returning 200?
2. Does response have `data.data` array?
3. Are there items in the array?

### Issue: Tasks Show But Wrong Data

**Check**:
1. Field names in API response
2. Mapper function field mappings
3. Console logs show actual vs expected structure

## Next Steps

If tasks still don't show:
1. Share the console output from the debug logs
2. Share the Network tab response for `/service-requests`
3. Check if backend has any service requests in database

## Files Modified
- `/pages/staff-portal.tsx` - Main component with task list
