# Service Request Management Module

## Overview
The Service Request Module handles all guest service requests including room service orders, housekeeping requests, maintenance issues, and general assistance.

## Database Models

### ServiceRequest
```go
type ServiceRequest struct {
    ID            uint      // Primary key
    ReservationID uint      // Foreign key to Reservation
    GuestID       uint      // Foreign key to Guest
    ServiceType   string    // room-service, housekeeping, maintenance, special-requests, transportation, general-assistance
    Status        string    // pending, in-progress, completed, cancelled
    Priority      string    // low, medium, high
    Description   string    // Request details
    Notes         string    // Additional notes
    AssignedTo    string    // Staff member assigned
    RequestedAt   time.Time // When request was made
    CompletedAt   *time.Time // When request was completed
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Reservation Reservation
    Guest       Guest
}
```

### RoomServiceOrder
```go
type RoomServiceOrder struct {
    ID            uint      // Primary key
    OrderID       string    // Unique order reference
    ReservationID uint      // Foreign key to Reservation
    GuestID       uint      // Foreign key to Guest
    Items         []Item    // Order items (JSON)
    Subtotal      float64   // Items subtotal
    DeliveryFee   float64   // Delivery charge
    Total         float64   // Total amount
    Status        string    // pending, preparing, delivered, cancelled
    SpecialNotes  string    // Special instructions
    OrderedAt     time.Time // Order time
    DeliveredAt   *time.Time // Delivery time
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Reservation Reservation
    Guest       Guest
}
```

### HousekeepingRequest
```go
type HousekeepingRequest struct {
    ID            uint      // Primary key
    ReservationID uint      // Foreign key to Reservation
    GuestID       uint      // Foreign key to Guest
    RequestType   string    // cleaning, linens, schedule
    Description   string    // Request details
    ScheduleTime  string    // morning, afternoon, immediate
    Status        string    // pending, in-progress, completed
    AssignedTo    string    // Staff member assigned
    RequestedAt   time.Time // When request was made
    CompletedAt   *time.Time // When request was completed
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Reservation Reservation
    Guest       Guest
}
```

### MaintenanceIssue
```go
type MaintenanceIssue struct {
    ID            uint      // Primary key
    ReservationID uint      // Foreign key to Reservation
    GuestID       uint      // Foreign key to Guest
    IssueType     string    // ac, tv, wifi, plumbing, lights, door-lock, noise, other
    Description   string    // Issue details
    Status        string    // reported, in-progress, resolved
    Priority      string    // low, medium, high
    AssignedTo    string    // Staff member assigned
    ReportedAt    time.Time // When issue was reported
    ResolvedAt    *time.Time // When issue was resolved
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Reservation Reservation
    Guest       Guest
}
```

## API Endpoints

### Service Requests

#### Get All Service Requests
```
GET /api/v1/service-requests?page=1&page_size=10&status=pending
```
**Response**: Paginated list of service requests

#### Get Service Request by ID
```
GET /api/v1/service-requests/:id
```
**Response**: Complete service request details

#### Create Service Request
```
POST /api/v1/service-requests
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "service_type": "room-service",
    "priority": "high",
    "description": "Order: 2x Caesar Salad, 1x Grilled Salmon"
}
```
**Response**: Created service request

#### Update Service Request
```
PUT /api/v1/service-requests/:id
Content-Type: application/json

{
    "status": "in-progress",
    "assigned_to": "John Smith",
    "notes": "Preparing order"
}
```
**Response**: Updated service request

#### Get Service Requests by Status
```
GET /api/v1/service-requests/status/pending
```
**Response**: List of requests with specified status

### Room Service Orders

#### Get All Room Service Orders
```
GET /api/v1/room-service-orders?page=1&page_size=10
```
**Response**: Paginated list of orders

#### Create Room Service Order
```
POST /api/v1/room-service-orders
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2
        },
        {
            "menu_item_id": 3,
            "quantity": 1
        }
    ],
    "special_notes": "No croutons on salad"
}
```
**Response**: Created order

#### Update Room Service Order Status
```
PUT /api/v1/room-service-orders/:id/status
Content-Type: application/json

{
    "status": "delivered"
}
```
**Response**: Updated order

### Housekeeping Requests

#### Get All Housekeeping Requests
```
GET /api/v1/housekeeping-requests?page=1&page_size=10
```
**Response**: Paginated list of requests

#### Create Housekeeping Request
```
POST /api/v1/housekeeping-requests
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

### Maintenance Issues

#### Get All Maintenance Issues
```
GET /api/v1/maintenance-issues?page=1&page_size=10
```
**Response**: Paginated list of issues

#### Create Maintenance Issue
```
POST /api/v1/maintenance-issues
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "issue_type": "ac",
    "description": "Air conditioning not working, room temperature too warm"
}
```
**Response**: Created issue

#### Update Maintenance Issue
```
PUT /api/v1/maintenance-issues/:id
Content-Type: application/json

{
    "status": "in-progress",
    "assigned_to": "Maintenance Team",
    "notes": "AC unit being serviced"
}
```
**Response**: Updated issue

## Business Logic

### Service Request Creation Flow
1. Validate reservation exists
2. Validate guest exists
3. Validate service type
4. Create service request with "pending" status
5. Assign priority based on service type
6. Notify staff
7. Return created request

### Room Service Order Flow
1. Validate reservation and guest
2. Validate menu items exist
3. Calculate subtotal from items
4. Add delivery fee
5. Calculate total
6. Create order with "pending" status
7. Send to kitchen
8. Return created order

### Housekeeping Request Flow
1. Validate reservation and guest
2. Validate request type
3. Create request with "pending" status
4. Assign to available housekeeping staff
5. Set schedule time
6. Notify housekeeping team
7. Return created request

### Maintenance Issue Flow
1. Validate reservation and guest
2. Validate issue type
3. Create issue with "reported" status
4. Set priority based on issue type
5. Assign to maintenance team
6. Send urgent notification if high priority
7. Return created issue

### Status Update Flow
1. Validate request/issue exists
2. Validate status transition
3. Update status
4. Update assigned staff if provided
5. Add notes
6. Send notification to guest
7. Return updated request

## Data Validation

### Service Request Validation
- Reservation ID: Required, must exist
- Guest ID: Required, must exist
- Service Type: Required, must be valid type
- Priority: Required, must be low/medium/high
- Description: Required, min 10 characters

### Room Service Order Validation
- Reservation ID: Required, must exist
- Guest ID: Required, must exist
- Items: Required, at least 1 item
- Menu Item ID: Must exist and be available
- Quantity: Must be positive integer

### Housekeeping Request Validation
- Reservation ID: Required, must exist
- Guest ID: Required, must exist
- Request Type: Required, valid type
- Description: Required, min 5 characters
- Schedule Time: Optional, valid time slot

### Maintenance Issue Validation
- Reservation ID: Required, must exist
- Guest ID: Required, must exist
- Issue Type: Required, valid type
- Description: Required, min 10 characters

## Response Examples

### Create Room Service Order Response
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
            },
            {
                "id": 3,
                "name": "Grilled Salmon",
                "price": 24.99,
                "quantity": 1
            }
        ],
        "subtotal": 50.97,
        "delivery_fee": 0.00,
        "total": 50.97,
        "status": "pending",
        "special_notes": "No croutons on salad",
        "ordered_at": "2024-12-05T10:30:00Z",
        "created_at": "2024-12-05T10:30:00Z",
        "updated_at": "2024-12-05T10:30:00Z"
    }
}
```

### Create Maintenance Issue Response
```json
{
    "success": true,
    "message": "Maintenance issue reported",
    "data": {
        "id": 1,
        "reservation_id": 1,
        "guest_id": 1,
        "issue_type": "ac",
        "description": "Air conditioning not working",
        "status": "reported",
        "priority": "high",
        "assigned_to": null,
        "reported_at": "2024-12-05T10:45:00Z",
        "created_at": "2024-12-05T10:45:00Z",
        "updated_at": "2024-12-05T10:45:00Z"
    }
}
```

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Reservation, guest, or item not found
- **409 Conflict**: Invalid status transition
- **422 Unprocessable Entity**: Menu item not available
- **500 Internal Server Error**: Database error

## Performance Optimization

### Database Indexes
- ReservationID
- GuestID
- ServiceType
- Status
- Priority
- RequestedAt

### Query Optimization
- Use pagination for lists
- Preload relations selectively
- Create database views for status summaries
- Cache menu items (1 hour TTL)

## Integration Points

### With Reservation Module
- Link requests to reservations
- Track services per stay
- Update reservation status

### With Guest Module
- Track service usage per guest
- Update guest preferences
- Generate service patterns

### With Dashboard Module
- Provide service request statistics
- Track pending requests
- Calculate service metrics

### With In-Room Tablet Module
- Display available services
- Accept service requests
- Show order status

## Future Enhancements

1. **Real-time Tracking**
   - Live order status updates
   - GPS tracking for delivery
   - Push notifications

2. **Advanced Scheduling**
   - Automatic staff assignment
   - Optimal scheduling algorithm
   - Capacity planning

3. **Quality Management**
   - Guest satisfaction surveys
   - Service quality ratings
   - Performance metrics

4. **Integration**
   - Third-party delivery services
   - External maintenance contractors
   - Payment processing
