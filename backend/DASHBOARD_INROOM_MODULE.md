# Dashboard & In-Room Tablet Module

## Overview
The Dashboard Module provides real-time analytics and statistics for hotel management. The In-Room Tablet Module provides a guest-facing interface for service requests and reservation information.

---

## Dashboard Module

### API Endpoints

#### Get Dashboard Statistics
```
GET /api/v1/dashboard/stats
```
**Response**: Comprehensive dashboard statistics

#### Get Room Status Summary
```
GET /api/v1/dashboard/room-status
```
**Response**: Room status breakdown

#### Get Service Requests Summary
```
GET /api/v1/dashboard/service-requests-summary
```
**Response**: Service request status summary

#### Get Revenue Statistics
```
GET /api/v1/dashboard/revenue
```
**Response**: Revenue analytics

### Dashboard Statistics

#### Overall Statistics
```json
{
    "total_guests": 1500,
    "total_rooms": 50,
    "occupied_rooms": 35,
    "available_rooms": 12,
    "maintenance_rooms": 2,
    "cleaning_rooms": 1,
    "pending_check_ins": 5,
    "pending_check_outs": 3,
    "pending_service_requests": 12,
    "today_revenue": 5250.00,
    "month_revenue": 125000.00,
    "occupancy_rate": 70.0
}
```

#### Room Status Summary
```json
{
    "available": 12,
    "occupied": 35,
    "maintenance": 2,
    "cleaning": 1
}
```

#### Service Request Summary
```json
{
    "pending": 8,
    "in_progress": 4,
    "completed": 156,
    "cancelled": 2
}
```

#### Revenue Statistics
```json
{
    "today_revenue": 5250.00,
    "today_orders": 45,
    "week_revenue": 36750.00,
    "month_revenue": 125000.00,
    "average_daily_revenue": 4464.29,
    "top_service": "room-service",
    "top_service_revenue": 18500.00
}
```

### Business Logic

#### Calculate Occupancy Rate
```
Occupied Rooms / Total Rooms × 100%
```

#### Calculate Daily Revenue
```
Sum of all orders placed today +
Sum of all room service orders today +
Additional charges from check-outs today
```

#### Calculate Monthly Revenue
```
Sum of all reservations for current month +
Sum of all service orders for current month
```

#### Room Status Calculation
1. Query all rooms
2. Group by status
3. Count each status
4. Calculate percentages
5. Return summary

#### Service Request Summary
1. Query all service requests
2. Group by status
3. Count each status
4. Calculate completion rate
5. Return summary

### Response Examples

#### Dashboard Stats Response
```json
{
    "success": true,
    "message": "Dashboard statistics retrieved successfully",
    "data": {
        "total_guests": 1500,
        "total_rooms": 50,
        "occupied_rooms": 35,
        "available_rooms": 12,
        "maintenance_rooms": 2,
        "cleaning_rooms": 1,
        "pending_check_ins": 5,
        "pending_check_outs": 3,
        "pending_service_requests": 12,
        "today_revenue": 5250.00,
        "month_revenue": 125000.00,
        "occupancy_rate": 70.0
    }
}
```

#### Room Status Summary Response
```json
{
    "success": true,
    "message": "Room status summary retrieved successfully",
    "data": {
        "available": 12,
        "occupied": 35,
        "maintenance": 2,
        "cleaning": 1
    }
}
```

### Performance Optimization

#### Caching Strategy
- Cache dashboard stats (5 minutes TTL)
- Cache room status (2 minutes TTL)
- Cache service request summary (2 minutes TTL)
- Cache revenue stats (1 hour TTL)
- Invalidate cache on relevant events

#### Database Optimization
- Create materialized views for statistics
- Use database aggregation functions
- Index status fields
- Use efficient COUNT queries

#### Real-time Updates
- WebSocket connections for live updates
- Event-driven cache invalidation
- Batch updates to reduce database load

---

## In-Room Tablet Module

### API Endpoints

#### Get Reservation Details
```
GET /api/v1/in-room-tablet/reservation/:reservationID
```
**Response**: Guest reservation information

#### Get Room Service Menu
```
GET /api/v1/in-room-tablet/menu
```
**Response**: Available menu items

#### Create Room Service Order
```
POST /api/v1/in-room-tablet/room-service-order
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2
        }
    ],
    "special_notes": "No croutons"
}
```
**Response**: Created order

#### Create Housekeeping Request
```
POST /api/v1/in-room-tablet/housekeeping-request
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "request_type": "cleaning",
    "description": "Clean room now",
    "schedule_time": "immediate"
}
```
**Response**: Created request

#### Create Maintenance Issue
```
POST /api/v1/in-room-tablet/maintenance-issue
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "issue_type": "ac",
    "description": "Air conditioning not working"
}
```
**Response**: Created issue

### In-Room Tablet Data Models

#### InRoomTabletReservation
```json
{
    "room_number": "305",
    "room_type": "Deluxe Suite",
    "guest_name": "John Doe",
    "check_in_date": "2024-12-15T00:00:00Z",
    "check_out_date": "2024-12-18T00:00:00Z",
    "check_in_time": "14:00",
    "check_out_time": "11:00",
    "nights": 3,
    "booking_id": "BK-12345",
    "total_price": 450.00,
    "paid_amount": 450.00,
    "preferences": [
        "Vegetarian meals",
        "Ground floor preferred",
        "Extra pillows"
    ]
}
```

#### InRoomTabletMenu
```json
{
    "id": 1,
    "name": "Caesar Salad",
    "description": "Fresh romaine, parmesan, croutons",
    "price": 12.99,
    "category": "Food",
    "available": true
}
```

### Response Examples

#### Get Reservation Response
```json
{
    "success": true,
    "message": "Reservation retrieved successfully",
    "data": {
        "room_number": "305",
        "room_type": "Deluxe Suite",
        "guest_name": "John Doe",
        "check_in_date": "2024-12-15T00:00:00Z",
        "check_out_date": "2024-12-18T00:00:00Z",
        "check_in_time": "14:00",
        "check_out_time": "11:00",
        "nights": 3,
        "booking_id": "BK-12345",
        "total_price": 450.00,
        "paid_amount": 450.00,
        "preferences": [
            "Vegetarian meals",
            "Ground floor preferred",
            "Extra pillows"
        ]
    }
}
```

#### Get Menu Response
```json
{
    "success": true,
    "message": "Menu items retrieved successfully",
    "data": [
        {
            "id": 1,
            "name": "Caesar Salad",
            "description": "Fresh romaine, parmesan, croutons",
            "price": 12.99,
            "category": "Food",
            "available": true
        },
        {
            "id": 2,
            "name": "Grilled Salmon",
            "description": "Atlantic salmon with seasonal vegetables",
            "price": 24.99,
            "category": "Food",
            "available": true
        },
        {
            "id": 6,
            "name": "Coffee",
            "description": "Freshly brewed premium coffee",
            "price": 3.99,
            "category": "Drinks",
            "available": true
        }
    ]
}
```

#### Create Room Service Order Response
```json
{
    "success": true,
    "message": "Order placed successfully",
    "data": {
        "id": 1,
        "order_id": "RSO-12345",
        "reservation_id": 1,
        "guest_id": 1,
        "items": [
            {
                "id": 1,
                "name": "Caesar Salad",
                "price": 12.99,
                "quantity": 2
            }
        ],
        "subtotal": 25.98,
        "delivery_fee": 0.00,
        "total": 25.98,
        "status": "pending",
        "special_notes": "No croutons",
        "ordered_at": "2024-12-15T14:30:00Z"
    }
}
```

### Business Logic

#### Get Reservation Flow
1. Validate reservation ID
2. Query reservation with guest and room info
3. Format response for tablet display
4. Include guest preferences
5. Return formatted data

#### Get Menu Flow
1. Query all menu items
2. Filter by available items
3. Group by category
4. Sort by category then name
5. Return formatted menu

#### Create Service Request Flow
1. Validate reservation and guest
2. Validate service type
3. Create service request
4. Assign priority based on type
5. Notify staff
6. Return confirmation

### Performance Optimization

#### Caching Strategy
- Cache menu items (1 hour TTL)
- Cache reservation details (30 minutes TTL)
- Cache guest preferences (1 hour TTL)
- Invalidate cache on updates

#### Database Optimization
- Index reservation ID
- Index menu item availability
- Use efficient queries
- Preload relations selectively

#### Response Optimization
- Minimize response payload
- Only include necessary fields
- Use pagination for large lists
- Compress responses

### Security Considerations

#### Authentication
- Verify tablet is authorized
- Validate reservation access
- Prevent unauthorized access

#### Data Privacy
- Only show reservation holder's data
- Limit data exposure
- Secure API endpoints

#### Input Validation
- Validate all inputs
- Prevent SQL injection
- Sanitize special characters

### Integration Points

#### With Reservation Module
- Fetch reservation details
- Update reservation status
- Link services to reservation

#### With Service Request Module
- Create service requests
- Track service requests
- Update service status

#### With Room Module
- Get room information
- Update room status
- Track room occupancy

#### With Guest Module
- Fetch guest preferences
- Update guest statistics
- Track guest services

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Reservation, menu item, or service not found
- **401 Unauthorized**: Tablet not authorized
- **403 Forbidden**: Access denied
- **500 Internal Server Error**: Database error

### Error Response Examples
```json
{
    "success": false,
    "message": "Failed to retrieve reservation",
    "error": "Reservation not found"
}
```

## Future Enhancements

### Dashboard
1. **Advanced Analytics**
   - Predictive analytics
   - Trend analysis
   - Forecasting

2. **Real-time Monitoring**
   - Live occupancy tracking
   - Real-time alerts
   - Performance metrics

3. **Custom Reports**
   - Customizable dashboards
   - Export capabilities
   - Scheduled reports

### In-Room Tablet
1. **Enhanced Features**
   - Video streaming
   - Local attractions
   - Concierge services

2. **Personalization**
   - Guest preferences
   - Recommendation engine
   - Personalized offers

3. **Integration**
   - Smart room controls
   - IoT device integration
   - Voice commands

4. **Entertainment**
   - On-demand movies
   - Music streaming
   - Gaming options
