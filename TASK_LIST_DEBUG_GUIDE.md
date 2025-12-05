# Task List Not Showing - Debug Guide

## Issue
The task list in the staff portal is not displaying assigned tasks.

## What I've Added

### 1. Console Logging
Added comprehensive logging to help identify the issue:
- API response logging
- Error logging with full error details
- Loading state logging
- Data transformation logging

### 2. Enhanced Error Display
The UI now shows:
- Detailed error messages
- Error type information
- Instruction to check browser console

## How to Debug

### Step 1: Open Browser Console
1. Navigate to the staff portal page
2. Open browser DevTools (F12 or Right-click → Inspect)
3. Go to the Console tab

### Step 2: Check Console Output
Look for these log messages:
```
Assigned tasks response: {...}
Assigned tasks data: [...]
Loading: true/false
Error: null/Error object
```

### Step 3: Check Network Tab
1. Go to Network tab in DevTools
2. Look for the request to `/service-requests/assigned`
3. Check:
   - Request URL (should be: `http://localhost:8080/api/v1/service-requests/assigned`)
   - Status Code (should be 200)
   - Response data structure

## Common Issues & Solutions

### Issue 1: 404 Not Found
**Problem**: Endpoint doesn't exist
**Solution**: Verify the backend endpoint is `/api/v1/service-requests/assigned`

### Issue 2: 401 Unauthorized
**Problem**: No authentication token
**Solution**: 
- Check if you're logged in
- Verify token exists in localStorage: `localStorage.getItem('auth_token')`
- The page will auto-redirect to login if token is missing

### Issue 3: Empty Response
**Problem**: API returns empty array
**Solution**: 
- Check if staff member (ID: 1) has assigned tasks in the database
- Verify the backend query filters tasks correctly

### Issue 4: Wrong Response Structure
**Problem**: API response doesn't match expected format
**Solution**: Check if response is:
```json
{
  "data": [...tasks...],
  "message": "...",
  "status": "OK"
}
```

## Expected API Response Format

The hook expects this structure:
```json
{
  "message": "Assigned tasks retrieved",
  "status": "OK",
  "data": [
    {
      "id": 1,
      "request_number": "HK-2024-001",
      "type": "housekeeping",
      "service_type": "cleaning",
      "status": "in_progress",
      "priority": "normal",
      "notes": "Please clean bathroom",
      "assigned_to": "Maria Garcia",
      "assigned_staff_id": 1,
      "assigned_at": "2024-12-05T09:30:00Z",
      "requested_at": "2024-12-05T09:00:00Z",
      "room": {
        "id": 5,
        "room_number": "201",
        "floor": 2
      },
      "guest": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "assigned_staff": {
        "id": 1,
        "employee_id": "HK-001",
        "first_name": "Maria",
        "last_name": "Garcia",
        "department": "housekeeping",
        "position": "Housekeeping Supervisor",
        "phone": "+1234567001"
      }
    }
  ],
  "errors": ""
}
```

## Testing Steps

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate to staff portal**: `/staff-portal`

3. **Open browser console** and check for logs

4. **Look for one of these states**:
   - Loading spinner (data is being fetched)
   - Error message (API call failed)
   - Empty state (no tasks assigned)
   - Task list (success!)

## Quick Test with cURL

Test the API endpoint directly:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/service-requests/assigned
```

Replace `YOUR_TOKEN` with the actual token from localStorage.

## Code Changes Made

### File: `/pages/staff-portal.tsx`

1. **Enhanced useGetAssignedTasks hook** (lines 94-114):
   - Added try-catch error handling
   - Added console logging
   - Handles multiple response formats
   - Added retry logic

2. **Added debug useEffect** (lines 290-294):
   - Logs data, loading, and error states
   - Helps track state changes

3. **Enhanced error UI** (lines 496-505):
   - Shows detailed error messages
   - Displays error type
   - Guides user to check console

## Next Steps

After checking the console and network tab, report:
1. What error message appears (if any)
2. The HTTP status code of the request
3. The actual response structure from the API
4. Any console errors or warnings

This will help identify the exact issue preventing tasks from displaying.
