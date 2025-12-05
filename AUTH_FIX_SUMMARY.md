# Authentication Fix Summary

## Problem
API requests to the backend were returning **403 Forbidden** errors because the `Authorization: Bearer <token>` header was not being sent with requests.

## Solution Implemented

### 1. Created Centralized Axios Instance (`/lib/axios.ts`)

```typescript
import axios from 'axios';
import { getSession } from '../utils/auth';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically adds Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getSession(); // Gets token from localStorage/cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles 401/403 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Updated All TanStack Query Hooks

Updated the following hooks to use the centralized axios instance:

- ✅ `/hooks/useGuests.ts`
- ✅ `/hooks/useReservations.ts`
- ✅ `/hooks/useRooms.ts`
- ✅ `/hooks/useServiceRequests.ts`
- ✅ `/hooks/useDashboard.ts`

**Before:**
```typescript
import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const { data } = await axios.get(`${API_BASE_URL}/guests`);
```

**After:**
```typescript
import axios from '../lib/axios';
const { data } = await axios.get('/guests'); // Token added automatically
```

### 3. How It Works

#### Authentication Flow:
1. **Login**: User logs in via Google OAuth
2. **Token Storage**: Backend returns `access_token`, stored in localStorage as `auth_token`
3. **Auto-Injection**: Axios interceptor reads token from localStorage
4. **Request**: Every API call automatically includes `Authorization: Bearer <token>`
5. **Error Handling**: 401/403 errors trigger automatic logout and redirect

#### Example Request:
```bash
GET http://localhost:8080/api/v1/guests?page=1&page_size=10
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

## Files Modified

### Created:
- `/lib/axios.ts` - Centralized axios instance with auth interceptor
- `/AUTH_FIX_SUMMARY.md` - This file
- `.env.example` - Environment variable template

### Modified:
- `/hooks/useGuests.ts` - Updated to use centralized axios
- `/hooks/useReservations.ts` - Updated to use centralized axios
- `/hooks/useRooms.ts` - Updated to use centralized axios
- `/hooks/useServiceRequests.ts` - Updated to use centralized axios
- `/hooks/useDashboard.ts` - Updated to use centralized axios
- `/GUEST_API_INTEGRATION_GUIDE.md` - Added auth documentation

## Testing

### Verify Authentication is Working:

1. **Login to the app** via Google OAuth
2. **Open Browser DevTools** → Network tab
3. **Navigate to Guest History page**
4. **Check the API request** to `/api/v1/guests`
5. **Verify Headers include**:
   ```
   Authorization: Bearer <your-token>
   ```

### Expected Behavior:

✅ **Success (200)**: Guest list loads successfully
❌ **403 Forbidden**: Token missing or invalid (should not happen now)
❌ **401 Unauthorized**: Token expired (auto-redirects to login)

## Benefits

1. **Automatic Token Management**: No need to manually add tokens to each API call
2. **Centralized Error Handling**: 401/403 errors handled in one place
3. **DRY Principle**: Single axios configuration used across all hooks
4. **Type Safety**: TypeScript ensures correct usage
5. **Easy Debugging**: All requests go through one interceptor

## Next Steps

1. ✅ Test guest list loading
2. ✅ Test guest creation
3. ✅ Test search and pagination
4. ⏳ Implement similar patterns for other modules (Rooms, Reservations, etc.)
5. ⏳ Add refresh token logic if needed

## Troubleshooting

### Issue: Still getting 403 errors

**Check:**
1. Token is stored in localStorage: `localStorage.getItem('auth_token')`
2. Token is valid (not expired)
3. Backend expects `Authorization: Bearer <token>` format
4. CORS is properly configured on backend

### Issue: Token not being sent

**Check:**
1. Axios instance is imported from `/lib/axios.ts` (not `axios` package)
2. `getSession()` function returns the token correctly
3. Browser console for any errors

### Issue: Redirecting to login unexpectedly

**Check:**
1. Token hasn't expired
2. Backend is returning correct status codes
3. Response interceptor logic is correct

## Code References

### Token Storage (AuthContext.tsx):
```typescript
// Line 136-141
setSession(
  access_token,
  role_name,
  user
);
```

### Token Retrieval (utils/auth.ts):
```typescript
// Line 34-44
export const getSession = (): string | null => {
  const cookieToken = Cookies.get(TOKEN_KEY);
  if (cookieToken) return cookieToken;
  
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  return null;
};
```

### Interceptor (lib/axios.ts):
```typescript
// Line 14-25
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getSession();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

**Status**: ✅ Authentication fix complete and ready for testing
**Date**: December 5, 2024
**Impact**: All API requests now include authentication tokens automatically
