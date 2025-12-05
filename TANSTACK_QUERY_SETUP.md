# TanStack Query (React Query) Setup Guide

## Overview
TanStack Query is configured and ready to use across the entire application for data fetching, caching, and state management.

## Setup Summary

### 1. Query Client Configuration
**File**: `lib/queryClient.ts`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 10,          // 10 minutes (cache time)
      retry: 1,                         // Retry failed requests once
      refetchOnWindowFocus: false,      // Don't refetch on window focus
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 2. App Provider Setup
**File**: `pages/_app.tsx`

The app is already wrapped with `QueryClientProvider` and includes:
- Centralized query client
- React Query DevTools for debugging
- Proper integration with other providers (Auth, Theme)

## Available Hooks

### Guest Management Hooks
**File**: `hooks/useGuests.ts`

```typescript
// Queries
useGetGuests(params)              // Get paginated guest list
useGetGuestById(id)               // Get single guest with full details
useGetGuestHistory(id)            // Get guest reservation history
useGetGuestPreferences(id)        // Get guest preferences
useGetGuestAIInsights(id)         // Get AI insights for guest

// Mutations
useCreateGuest()                  // Create new guest
useUpdateGuest(id)                // Update guest info
useDeleteGuest()                  // Delete guest
```

### Reservation Hooks
**File**: `hooks/useReservations.ts`

```typescript
// Queries
useGetReservations(params)        // Get paginated reservations
useGetReservationById(id)         // Get single reservation
useGetReservationsByGuest(guestId) // Get guest's reservations
useGetReservationsByRoom(roomId)  // Get room's reservations

// Mutations
useCreateReservation()            // Create new reservation
useUpdateReservation(id)          // Update reservation
useDeleteReservation()            // Delete reservation
```

### Room Management Hooks
**File**: `hooks/useRooms.ts`

```typescript
// Queries
useGetRooms(params)               // Get paginated rooms
useGetRoomById(id)                // Get single room
useGetAvailableRooms(params)      // Get available rooms for dates

// Mutations
useCreateRoom()                   // Create new room
useUpdateRoom(id)                 // Update room info
useUpdateRoomStatus(id)           // Update room status
useDeleteRoom()                   // Delete room
```

### Service Request Hooks
**File**: `hooks/useServiceRequests.ts`

```typescript
// Queries
useGetServiceRequests(params)     // Get paginated service requests
useGetServiceRequestById(id)      // Get single service request
useGetServiceRequestsByReservation(id) // Get requests for reservation
useGetServiceRequestsByGuest(id)  // Get requests for guest
useGetServiceRequestsByStatus(status) // Get requests by status

// Mutations
useCreateServiceRequest()         // Create new service request
useUpdateServiceRequest(id)       // Update service request
useDeleteServiceRequest()         // Delete service request
```

### Dashboard Hooks
**File**: `hooks/useDashboard.ts`

```typescript
// Queries (with auto-refetch)
useGetDashboardStats()            // Get overall dashboard stats (refetch every 1 min)
useGetRoomStatusSummary()         // Get room status breakdown (refetch every 1 min)
useGetServiceRequestsSummary()    // Get service request summary (refetch every 1 min)
useGetRevenueStats()              // Get revenue analytics (refetch every 5 min)
```

## Usage Examples

### Example 1: Fetching Guest List
```typescript
import { useGetGuests } from '@/hooks/useGuests';

export default function GuestListPage() {
  const { data, isLoading, error } = useGetGuests({ page: 1, page_size: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data?.map(guest => (
        <div key={guest.id}>{guest.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: Creating a Guest
```typescript
import { useCreateGuest } from '@/hooks/useGuests';
import { useState } from 'react';

export default function CreateGuestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    id_type: '',
    id_number: '',
  });

  const { mutate: createGuest, isPending } = useCreateGuest();

  const handleSubmit = (e) => {
    e.preventDefault();
    createGuest(formData, {
      onSuccess: () => {
        alert('Guest created successfully!');
        setFormData({ /* reset */ });
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Guest'}
      </button>
    </form>
  );
}
```

### Example 3: Fetching Guest Details with Relations
```typescript
import { useGetGuestById } from '@/hooks/useGuests';
import { useRouter } from 'next/router';

export default function GuestDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: guest, isLoading, error } = useGetGuestById(Number(id));

  if (isLoading) return <div>Loading guest...</div>;
  if (error) return <div>Error loading guest</div>;

  return (
    <div>
      <h1>{guest?.name}</h1>
      <p>Email: {guest?.email}</p>
      <p>Reservations: {guest?.reservations?.length}</p>
      <p>Risk Score: {guest?.ai_insights?.risk_score}</p>
    </div>
  );
}
```

### Example 4: Dashboard with Real-time Updates
```typescript
import { useGetDashboardStats, useGetRoomStatusSummary } from '@/hooks/useDashboard';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: roomStatus, isLoading: roomLoading } = useGetRoomStatusSummary();

  if (statsLoading || roomLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Occupancy Rate: {stats?.occupancy_rate}%</div>
      <div>Available Rooms: {roomStatus?.available}</div>
      <div>Occupied Rooms: {roomStatus?.occupied}</div>
    </div>
  );
}
```

### Example 5: Updating Service Request Status
```typescript
import { useUpdateServiceRequest } from '@/hooks/useServiceRequests';

export default function ServiceRequestCard({ requestId }) {
  const { mutate: updateRequest, isPending } = useUpdateServiceRequest(requestId);

  const handleMarkComplete = () => {
    updateRequest(
      { status: 'completed' },
      {
        onSuccess: () => {
          alert('Request marked as completed!');
        },
      }
    );
  };

  return (
    <button onClick={handleMarkComplete} disabled={isPending}>
      {isPending ? 'Updating...' : 'Mark Complete'}
    </button>
  );
}
```

## Query Key Structure

TanStack Query uses query keys to manage cache. Each module has a structured key system:

### Guest Keys
```typescript
guestKeys.all                    // ['guests']
guestKeys.lists()                // ['guests', 'list']
guestKeys.list(filters)          // ['guests', 'list', { page: 1, ... }]
guestKeys.details()              // ['guests', 'detail']
guestKeys.detail(id)             // ['guests', 'detail', 1]
guestKeys.history(id)            // ['guests', 'detail', 1, 'history']
guestKeys.preferences(id)        // ['guests', 'detail', 1, 'preferences']
guestKeys.aiInsights(id)         // ['guests', 'detail', 1, 'ai-insights']
```

### Reservation Keys
```typescript
reservationKeys.all              // ['reservations']
reservationKeys.lists()          // ['reservations', 'list']
reservationKeys.list(filters)    // ['reservations', 'list', { page: 1, ... }]
reservationKeys.details()        // ['reservations', 'detail']
reservationKeys.detail(id)       // ['reservations', 'detail', 1]
reservationKeys.byGuest(id)      // ['reservations', 'guest', 1]
reservationKeys.byRoom(id)       // ['reservations', 'room', 5]
```

## Cache Invalidation

When mutations succeed, related queries are automatically invalidated:

```typescript
// When creating a guest, these queries are invalidated:
- guestKeys.lists()              // Guest list will refetch
- guestKeys.byGuest(guestId)     // Guest details will refetch

// When updating a reservation:
- reservationKeys.detail(id)     // Reservation details refetch
- reservationKeys.lists()        // Reservation list refetch
- reservationKeys.byGuest(id)    // Guest's reservations refetch
```

## Best Practices

### 1. Use Enabled Queries for Conditional Fetching
```typescript
const { data } = useGetGuestById(id, {
  enabled: !!id,  // Only fetch if id exists
});
```

### 2. Handle Loading and Error States
```typescript
const { data, isLoading, error, isError } = useGetGuests();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;
return <GuestList guests={data} />;
```

### 3. Use Callbacks for Side Effects
```typescript
const { mutate } = useCreateGuest();

mutate(guestData, {
  onSuccess: (data) => {
    // Handle success
    router.push(`/guests/${data.id}`);
  },
  onError: (error) => {
    // Handle error
    toast.error(error.message);
  },
});
```

### 4. Combine Multiple Queries
```typescript
const guest = useGetGuestById(guestId);
const reservations = useGetReservationsByGuest(guestId);

if (guest.isLoading || reservations.isLoading) return <Loading />;

return (
  <div>
    <h1>{guest.data?.name}</h1>
    <ReservationList reservations={reservations.data} />
  </div>
);
```

### 5. Prefetch Data for Better UX
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { guestKeys } from '@/hooks/useGuests';

export default function GuestList() {
  const queryClient = useQueryClient();

  const prefetchGuestDetails = (guestId) => {
    queryClient.prefetchQuery({
      queryKey: guestKeys.detail(guestId),
      queryFn: () => fetchGuestDetails(guestId),
    });
  };

  return (
    <div>
      {guests.map(guest => (
        <div
          key={guest.id}
          onMouseEnter={() => prefetchGuestDetails(guest.id)}
        >
          {guest.name}
        </div>
      ))}
    </div>
  );
}
```

## Environment Configuration

Set your API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Debugging

### React Query DevTools
The app includes React Query DevTools for debugging:
- Available in development mode
- Shows all queries and mutations
- Displays cache state
- Allows manual cache manipulation

Access it by looking for the floating icon in the bottom-right corner of the page.

## Performance Tips

1. **Stale Time**: Data is considered fresh for 5 minutes by default
2. **Cache Time**: Unused data is garbage collected after 10 minutes
3. **Refetch Interval**: Dashboard queries refetch every 1-5 minutes
4. **Pagination**: Use pagination to reduce payload size
5. **Selective Preloading**: Only preload data when needed

## Common Issues & Solutions

### Issue: Data not updating after mutation
**Solution**: Ensure mutation invalidates correct query keys

### Issue: Duplicate requests
**Solution**: Check staleTime and gcTime settings

### Issue: Memory leaks
**Solution**: Queries are automatically cleaned up by TanStack Query

## Next Steps

1. Replace mock data in pages with actual API calls using these hooks
2. Add error boundaries for better error handling
3. Implement optimistic updates for better UX
4. Add request/response interceptors for auth tokens
5. Set up error logging and monitoring
