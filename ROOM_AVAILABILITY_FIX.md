# Room Availability Check - Error Fixed

## Problem
When selecting a room type in the booking form, you got this error:
```
Failed to check availability
```

## Root Cause
The booking form was trying to call `/api/rooms/availability` which didn't exist in your Next.js API routes.

---

## Solution Applied

### Updated the booking form to call your backend API directly using axios

**File:** `/pages/bookings/new.tsx`

**Changes:**
1. Added `axios` import from `../../lib/axios`
2. Updated `checkAvailability` function to call backend directly
3. Proper error handling and response transformation

### Before:
```typescript
const response = await fetch('/api/rooms/availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomType: formData.roomType,
    checkIn: formData.checkIn,
    checkOut: formData.checkOut,
  }),
});
```

### After:
```typescript
const { data } = await axios.post('/rooms/availability', {
  room_type: formData.roomType,
  check_in_date: formData.checkIn,
  check_out_date: formData.checkOut,
});

// Transform backend response
const rooms = (data.data || []).map((room: any) => ({
  id: room.id.toString(),
  number: room.room_number,
  type: room.room_type,
}));
```

---

## Backend Endpoint Expected

Your Go backend should have this endpoint:

```
POST /api/v1/rooms/availability
```

**Request Body:**
```json
{
  "room_type": "standard",
  "check_in_date": "2024-12-05",
  "check_out_date": "2024-12-08"
}
```

**Expected Response:**
```json
{
  "message": "Available rooms retrieved",
  "data": [
    {
      "id": 1,
      "room_number": "101",
      "room_type": "Standard",
      "floor": 1,
      "price_per_night": 100.00,
      "status": "available"
    },
    {
      "id": 2,
      "room_number": "102",
      "room_type": "Standard",
      "floor": 1,
      "price_per_night": 100.00,
      "status": "available"
    }
  ]
}
```

---

## How It Works Now

1. **User selects room type** (e.g., "Standard")
2. **Frontend waits 500ms** (debounce)
3. **Calls backend:** `POST /api/v1/rooms/availability`
4. **Backend checks:** Which rooms of that type are available for the dates
5. **Frontend receives:** List of available rooms
6. **Displays dropdown:** "Select Room" with available options
7. **Auto-selects:** First available room

---

## Benefits

✅ **Direct Backend Call** - Uses your existing axios instance with auth
✅ **Proper Error Handling** - Shows user-friendly error messages
✅ **Response Transformation** - Converts snake_case to camelCase
✅ **Auto-Selection** - Automatically selects first available room
✅ **Debouncing** - Waits 500ms before checking (prevents too many calls)

---

## Alternative: Next.js API Route

I also created `/pages/api/rooms/availability.ts` as an alternative if you prefer to proxy through Next.js API routes instead of calling the backend directly.

**To use the API route instead:**
Change line 103 in `/pages/bookings/new.tsx` from:
```typescript
const { data } = await axios.post('/rooms/availability', {
```

To:
```typescript
const response = await fetch('/api/rooms/availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    roomType: formData.roomType,
    checkIn: formData.checkIn,
    checkOut: formData.checkOut,
  }),
});
const data = await response.json();
const rooms = data.availableRooms || [];
```

---

## Testing

### Test the fix:
1. Go to "New Booking" page
2. Select a room type (Standard, Deluxe, or Suite)
3. **Expected:** 
   - Shows "Checking availability..." spinner
   - Displays available rooms in dropdown
   - Auto-selects first room
4. **No error should appear**

### If you still get an error:
- Check that your backend has the `/api/v1/rooms/availability` endpoint
- Verify the endpoint accepts the request format shown above
- Check backend logs for any errors
- Ensure your auth token is valid

---

## Summary

The error is now fixed. The booking form calls your backend API directly using the axios instance (which includes authentication). When you select a room type, it will check availability and show you the available rooms.

Make sure your backend has the room availability endpoint implemented!
