# Guest Management API Integration Guide

## ✅ Authentication Fixed

All API requests now automatically include the Bearer token via Axios interceptor. The token is retrieved from localStorage and added to the `Authorization` header on every request.

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Authentication Flow

The app uses Google OAuth for authentication:

1. User logs in via Google OAuth
2. Backend returns `access_token` in response
3. Token is stored in localStorage as `auth_token`
4. Axios interceptor automatically adds `Authorization: Bearer <token>` to all API requests
5. If 401/403 errors occur, user is redirected to login page

### 2. Start Backend Server

Make sure your Go backend is running on port 8080:

```bash
cd backend
go run main.go
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Testing the Guest Management Integration

### Test 1: View Guest List

1. Navigate to **Guest History** page from sidebar
2. You should see:
   - Loading spinner while fetching
   - Paginated list of guests from backend
   - Guest cards showing: name, email, phone, join date, nationality

**Expected API Call:**
```
GET http://localhost:8080/api/v1/guests?page=1&page_size=10
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guests retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "nationality": "United States",
      "id_type": "Passport",
      "id_number": "US123456789",
      "join_date": "2023-01-15T00:00:00Z",
      "created_at": "2023-01-15T00:00:00Z",
      "updated_at": "2024-12-05T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total": 150,
    "total_pages": 15
  }
}
```

---

### Test 2: Search Guests

1. Type in the search box (e.g., "john")
2. Search is debounced (300ms delay)
3. Results should filter automatically

**Expected API Call:**
```
GET http://localhost:8080/api/v1/guests?page=1&page_size=10&search=john
```

---

### Test 3: Create New Guest

1. Click **"New Guest"** button (top-right)
2. Fill in the form:
   - Full Name: "Jane Smith"
   - Email: "jane.smith@example.com"
   - Phone: "+1234567891"
   - Nationality: "Canada"
   - ID Type: "Passport"
   - ID Number: "CA987654321"
3. Click **"Create Guest"**
4. Should see success toast notification
5. Guest list should refresh with new guest

**Expected API Call:**
```
POST http://localhost:8080/api/v1/guests
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567891",
  "nationality": "Canada",
  "id_type": "Passport",
  "id_number": "CA987654321"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest created successfully",
  "data": {
    "id": 151,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567891",
    "nationality": "Canada",
    "id_type": "Passport",
    "id_number": "CA987654321",
    "join_date": "2024-12-05T00:00:00Z",
    "created_at": "2024-12-05T00:00:00Z",
    "updated_at": "2024-12-05T00:00:00Z"
  }
}
```

---

### Test 4: View Guest Profile

1. Click the chevron icon on any guest card
2. Modal should open showing:
   - Guest basic info (name, email, phone, nationality, ID)
   - Statistics (if available from backend)
   - Reservation timeline (if available)
   - Preferences (if available)
   - AI Insights (if available)

**Expected API Calls:**
```
GET http://localhost:8080/api/v1/guests/1
GET http://localhost:8080/api/v1/guests/1/history
GET http://localhost:8080/api/v1/guests/1/preferences
GET http://localhost:8080/api/v1/guests/1/ai-insights
```

---

### Test 5: Pagination

1. Scroll to bottom of guest list
2. Click page numbers or next/previous buttons
3. Should load different pages of guests

**Expected API Call:**
```
GET http://localhost:8080/api/v1/guests?page=2&page_size=10
```

---

## Error Handling Tests

### Test 6: Duplicate Email Error

1. Try to create a guest with an existing email
2. Should see error toast: "Email already exists"

**Expected Response:**
```json
{
  "success": false,
  "message": "Failed to create guest",
  "error": "Email already exists"
}
```

---

### Test 7: Validation Errors

1. Try to create guest with invalid data:
   - Name less than 2 characters
   - Invalid email format
   - Missing required fields
2. Should see appropriate error messages

---

### Test 8: Backend Offline

1. Stop the Go backend server
2. Refresh the page
3. Should see error message: "Error loading guests. Please try again."

---

## Browser DevTools Checks

### Network Tab

Check the following:
- ✅ API calls are made to `http://localhost:8080/api/v1/guests`
- ✅ Request headers include `Content-Type: application/json`
- ✅ Response status codes (200, 201, 400, 409, etc.)
- ✅ Response data structure matches expected format

### React Query DevTools

1. Look for floating icon in bottom-right corner
2. Click to open DevTools
3. Check:
   - ✅ Query keys: `['guests', 'list', {...}]`
   - ✅ Query status: loading, success, error
   - ✅ Cached data
   - ✅ Stale time and cache time

### Console

Check for:
- ✅ No console errors
- ✅ Toast notifications appear correctly
- ✅ API responses logged (if debugging)

---

## Known Issues & Notes

### Backend Field Mapping

The backend uses snake_case while frontend uses camelCase. The integration handles this with proper mapping:

**Backend (snake_case):**
- `id_type`
- `id_number`
- `join_date`
- `created_at`
- `updated_at`

**Frontend (camelCase in display):**
- Handled automatically by accessing properties directly

### Mock Data vs Real Data

The page still contains mock data for the guest profile modal details (reservations, preferences, AI insights). These sections will display:
- Empty arrays for new guests
- Real data once backend endpoints return full guest details

### Future Enhancements

1. **Update Guest** - Add edit functionality
2. **Delete Guest** - Add delete confirmation modal
3. **Export Guests** - Add CSV/PDF export
4. **Bulk Operations** - Select multiple guests for bulk actions
5. **Advanced Filters** - Filter by nationality, join date, etc.

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:**
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check browser console for CORS errors

### Issue: "Guests not loading"

**Solution:**
1. Open React Query DevTools
2. Check query status and error messages
3. Verify API response structure matches expected format
4. Check network tab for failed requests

### Issue: "Create guest not working"

**Solution:**
1. Check form validation errors
2. Verify all required fields are filled
3. Check network tab for API response
4. Look for error toast messages

### Issue: "Search not working"

**Solution:**
1. Wait 300ms after typing (debounce delay)
2. Check network tab for search API call
3. Verify search parameter is sent correctly

---

## Success Criteria

✅ Guest list loads from backend
✅ Pagination works correctly
✅ Search filters guests
✅ Create guest form submits successfully
✅ Success/error toasts appear
✅ Guest profile modal opens
✅ Loading states display correctly
✅ Error states handled gracefully
✅ React Query cache updates automatically

---

## Next Steps

1. Test all scenarios above
2. Add authentication headers when auth is implemented
3. Integrate reservation, preferences, and AI insights endpoints
4. Add update and delete functionality
5. Implement real-time updates with WebSockets (optional)
