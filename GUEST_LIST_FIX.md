# Guest List Display Fix

## Problem Identified

Created guests were not appearing in the guest list due to **incorrect API response parsing**.

### Root Cause

The backend API returns a nested response structure:
```json
{
  "message": "Guests retrieved successfully",
  "data": {
    "data": [...],  // <-- Guest array
    "meta": {...}   // <-- Pagination info
  }
}
```

The `useGetGuests` hook was returning the entire `data` object instead of extracting the nested `data.data` object, causing the frontend to not properly access the guest list.

## Changes Made

### 1. Fixed `useGetGuests` Hook
**File:** `/hooks/useGuests.ts`

**Before:**
```typescript
export const useGetGuests = (params: GetGuestsParams = {}) => {
  return useQuery({
    queryKey: guestKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/guests', { params });
      return data; // ❌ Returns entire response
    },
  });
};
```

**After:**
```typescript
export const useGetGuests = (params: GetGuestsParams = {}) => {
  return useQuery<GetGuestsResponse>({
    queryKey: guestKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/guests', { params });
      return data.data; // ✅ Extracts nested data object
    },
  });
};
```

### 2. Added TypeScript Interface
Added `GetGuestsResponse` interface for type safety:
```typescript
interface GetGuestsResponse {
  data: Guest[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
```

## How It Works Now

1. **API Call:** `GET /api/v1/guests?page=1&page_size=10`
2. **Backend Response:**
   ```json
   {
     "message": "Guests retrieved successfully",
     "data": {
       "data": [{ guest1 }, { guest2 }],
       "meta": { page: 1, total: 2 }
     }
   }
   ```
3. **Hook Returns:** `{ data: [...], meta: {...} }`
4. **Frontend Access:**
   - `guestsData.data` → Guest array ✅
   - `guestsData.meta` → Pagination info ✅

## Testing Steps

### 1. Create a New Guest
1. Navigate to Guest History page
2. Click "New Guest" button
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "+1234567890"
   - Nationality: "United States"
   - ID Type: "Passport"
   - ID Number: "TEST123"
4. Click "Create Guest"
5. **Expected:** Success toast appears and guest list refreshes

### 2. Verify Guest Appears
1. Check the guest list
2. **Expected:** New guest "Test User" should be visible in the list

### 3. Check Pagination
1. If you have more than 10 guests, check pagination controls
2. **Expected:** Correct page count and navigation

### 4. Test Search
1. Type guest name in search box
2. **Expected:** Results filter after 300ms debounce

## Debugging Tips

### Check Browser Console
```javascript
// In browser console, check React Query cache
window.__REACT_QUERY_DEVTOOLS__
```

### Check Network Tab
1. Open DevTools → Network tab
2. Create a guest
3. Look for:
   - `POST /api/v1/guests` → Should return 200/201
   - `GET /api/v1/guests` → Should be called after creation
   - Response should have nested `data.data` structure

### Check Response Structure
If guests still don't appear, verify the API response:
```javascript
// Add this temporarily to useGetGuests
queryFn: async () => {
  const { data } = await axios.get('/guests', { params });
  console.log('API Response:', data);
  console.log('Extracted data:', data.data);
  return data.data;
}
```

## Additional Notes

- The fix also corrected the `service_usage` vs `serviceUsage` property name issue
- All other hooks (`useGetGuestById`, `useCreateGuest`, etc.) already had correct response extraction
- The frontend code in `guesthistory.tsx` was already correctly accessing `guestsData.data` and `guestsData.meta`

## Related Files
- `/hooks/useGuests.ts` - Guest API hooks
- `/pages/guesthistory.tsx` - Guest list page
- `/lib/axios.ts` - Axios instance with auth interceptor
- `/backend/routes/routes.go` - Backend API routes
