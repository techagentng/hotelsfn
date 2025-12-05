# Staff Portal API Integration

## Summary
Successfully integrated the staff portal with the backend API endpoint for assigned tasks, replacing hardcoded dummy data with real-time data from the server.

## Changes Made

### 1. API Integration
- **Endpoint**: `GET /api/v1/service-requests/assigned`
- Created custom hook `useGetAssignedTasks()` to fetch assigned tasks
- Added proper TypeScript interfaces matching the API response structure

### 2. Type Definitions

#### AssignedTask Interface
Matches the API response structure:
```typescript
interface AssignedTask {
  id: number;
  request_number: string;
  type: string;
  service_type: string;
  status: string;
  priority: string;
  notes: string;
  assigned_to: string;
  assigned_staff_id: number;
  assigned_at: string;
  requested_at: string;
  started_at?: string;
  completed_at?: string;
  room: {
    id: number;
    room_number: string;
    floor: number;
  };
  guest: {
    id: number;
    first_name: string;
    last_name: string;
  };
  assigned_staff: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    phone: string;
  };
}
```

### 3. Data Mapping
Created `mapAssignedTaskToTask()` function to transform API data to the internal Task format:
- Maps API status values to local TaskStatus enum
- Generates appropriate icons based on task type
- Combines guest first and last names
- Extracts room number from nested room object

### 4. UI Enhancements

#### Loading States
- Added spinner with "Loading tasks..." message while fetching data
- Displays error state if API call fails
- Shows empty state when no tasks are assigned

#### Task Display
Enhanced task cards to show:
- Task icon (🧹, 🔧, 🍽️, 👔, 📋)
- Request number (e.g., "HK-2024-001")
- Guest name
- Room number
- Service type
- Priority level
- Status badge
- Request timestamp

#### Task Detail Modal
Enhanced modal to display:
- Request number
- Guest name
- All task details from API
- Status update functionality with proper API mapping

### 5. Real-time Updates
- Integrated with TanStack Query for automatic caching and refetching
- Added query invalidation after task updates to refresh the list
- Maintains optimistic UI updates

## Status Mapping

### Local to API
- `assigned` → `pending`
- `in_progress` → `in-progress`
- `completed` → `completed`

### API to Local
- `pending` / `assigned` → `assigned`
- `in-progress` / `in_progress` → `in_progress`
- `completed` → `completed`

## Icon Mapping
- `housekeeping` → 🧹
- `maintenance` → 🔧
- `room-service` → 🍽️
- `laundry` → 👔
- `default` → 📋

## Files Modified
- `/pages/staff-portal.tsx` - Main component with API integration

## Dependencies Used
- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client
- `react-hot-toast` - Toast notifications

## Testing Checklist
- [ ] Verify tasks load from API on page load
- [ ] Check loading state displays correctly
- [ ] Confirm error handling works when API fails
- [ ] Test task status updates
- [ ] Verify query invalidation refreshes the list
- [ ] Check all task details display correctly
- [ ] Test with different task types (housekeeping, maintenance, etc.)
- [ ] Verify guest names and request numbers appear
- [ ] Test empty state when no tasks assigned

## Next Steps
1. Add filtering by task status (assigned, in progress, completed)
2. Implement real-time updates using WebSockets or polling
3. Add task assignment functionality
4. Implement task search and filtering
5. Add pagination for large task lists
