# Guest Management Testing Checklist

## Pre-Testing Setup

- [ ] Backend server running on port 8080
- [ ] Frontend server running on port 3000
- [ ] `.env.local` file created with `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`
- [ ] Logged in via Google OAuth
- [ ] Token stored in localStorage (`auth_token`)

## Quick Verification

### Check Token in Browser Console:
```javascript
localStorage.getItem('auth_token')
// Should return: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Test Cases

### ✅ Test 1: Guest List Loading
**Steps:**
1. Navigate to `/guesthistory`
2. Wait for page to load

**Expected:**
- ✅ Loading spinner appears
- ✅ Guest list displays
- ✅ No 403 errors in console
- ✅ Network tab shows: `GET /api/v1/guests?page=1&page_size=10` with status 200
- ✅ Request headers include `Authorization: Bearer <token>`

**Actual Result:** _____________

---

### ✅ Test 2: Search Functionality
**Steps:**
1. Type "john" in search box
2. Wait 300ms (debounce)

**Expected:**
- ✅ API call with `search=john` parameter
- ✅ Filtered results display
- ✅ Authorization header present

**Actual Result:** _____________

---

### ✅ Test 3: Create New Guest
**Steps:**
1. Click "New Guest" button
2. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "+1234567890"
   - Nationality: "USA"
   - ID Type: "Passport"
   - ID Number: "TEST123"
3. Click "Create Guest"

**Expected:**
- ✅ Success toast appears
- ✅ Modal closes
- ✅ Guest list refreshes
- ✅ New guest appears in list
- ✅ Network tab shows: `POST /api/v1/guests` with status 201
- ✅ Authorization header present

**Actual Result:** _____________

---

### ✅ Test 4: View Guest Profile
**Steps:**
1. Click chevron icon on any guest card
2. Modal should open

**Expected:**
- ✅ Modal displays guest details
- ✅ Multiple API calls made:
  - `GET /api/v1/guests/{id}`
  - `GET /api/v1/guests/{id}/history`
  - `GET /api/v1/guests/{id}/preferences`
  - `GET /api/v1/guests/{id}/ai-insights`
- ✅ All requests have Authorization header

**Actual Result:** _____________

---

### ✅ Test 5: Pagination
**Steps:**
1. Scroll to bottom of guest list
2. Click "Next" or page number

**Expected:**
- ✅ API call with updated `page` parameter
- ✅ Different guests load
- ✅ Authorization header present

**Actual Result:** _____________

---

### ✅ Test 6: Error Handling - Duplicate Email
**Steps:**
1. Try to create guest with existing email
2. Submit form

**Expected:**
- ✅ Error toast appears
- ✅ Error message: "Email already exists"
- ✅ Modal stays open

**Actual Result:** _____________

---

### ✅ Test 7: Unauthorized Access (Token Expired)
**Steps:**
1. Clear token: `localStorage.removeItem('auth_token')`
2. Refresh page or navigate to `/guesthistory`

**Expected:**
- ✅ API returns 401 Unauthorized
- ✅ Automatically redirected to `/login`
- ✅ Session cleared

**Actual Result:** _____________

---

## Network Tab Verification

### Sample Request Headers:
```
GET /api/v1/guests?page=1&page_size=10 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
```

### Sample Response (Success):
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
      "join_date": "2023-01-15T00:00:00Z"
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

## React Query DevTools Checks

Open React Query DevTools (bottom-right corner):

- [ ] Query key: `['guests', 'list', {page: 1, page_size: 10}]`
- [ ] Status: `success`
- [ ] Data cached correctly
- [ ] Stale time: 5 minutes
- [ ] Cache time: 10 minutes

---

## Common Issues & Solutions

### Issue: 403 Forbidden
**Solution:**
- Check token exists: `localStorage.getItem('auth_token')`
- Verify axios instance is imported from `/lib/axios.ts`
- Check backend logs for authorization errors

### Issue: No data loading
**Solution:**
- Check backend is running
- Verify API URL in `.env.local`
- Check browser console for errors
- Verify network requests in DevTools

### Issue: Token not being sent
**Solution:**
- Ensure using centralized axios from `/lib/axios.ts`
- Check `getSession()` returns token
- Verify interceptor is configured

---

## Performance Checks

- [ ] Initial page load < 3 seconds
- [ ] Search debounce working (300ms delay)
- [ ] No unnecessary re-renders
- [ ] React Query cache working (no duplicate requests)
- [ ] Loading states display correctly

---

## Browser Console Checks

Should see:
```
✅ No 403 Forbidden errors
✅ No CORS errors
✅ No undefined/null errors
✅ Toast notifications working
```

---

## Final Verification

- [ ] All API requests include `Authorization: Bearer <token>`
- [ ] Guest list loads successfully
- [ ] Search works
- [ ] Create guest works
- [ ] View profile works
- [ ] Pagination works
- [ ] Error handling works
- [ ] Auto-logout on 401 works

---

**Test Date:** _____________
**Tested By:** _____________
**Status:** ⏳ Pending / ✅ Passed / ❌ Failed
**Notes:** _____________________________________________
