# Reservation Management Module

## Overview
The Reservation Module manages all booking operations, reservation lifecycle, and guest stay tracking.

## Database Models

### Reservation
```go
type Reservation struct {
    ID            uint      // Primary key
    BookingID     string    // Unique booking reference
    GuestID       uint      // Foreign key to Guest
    RoomID        uint      // Foreign key to Room
    CheckInDate   time.Time // Check-in date
    CheckOutDate  time.Time // Check-out date
    Nights        int       // Number of nights
    TotalPrice    float64   // Total booking price
    PaidAmount    float64   // Amount paid
    Status        string    // pending, confirmed, checked-in, checked-out, cancelled
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Guest           Guest
    Room            Room
    ServiceRequests []ServiceRequest
}
```

## API Endpoints

### Get All Reservations
```
GET /api/v1/reservations?page=1&page_size=10&status=confirmed
```
**Query Parameters**:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10)
- `status`: Filter by status (optional)

**Response**: Paginated list of reservations

### Get Reservation by ID
```
GET /api/v1/reservations/:id
```
**Response**: Complete reservation with guest and room details

### Create Reservation
```
POST /api/v1/reservations
Content-Type: application/json

{
    "guest_id": 1,
    "room_id": 5,
    "check_in_date": "2024-12-15T14:00:00Z",
    "check_out_date": "2024-12-18T11:00:00Z",
    "total_price": 450.00
}
```
**Response**: Created reservation object

### Update Reservation
```
PUT /api/v1/reservations/:id
Content-Type: application/json

{
    "status": "confirmed",
    "total_price": 500.00
}
```
**Response**: Updated reservation object

### Delete Reservation
```
DELETE /api/v1/reservations/:id
```
**Response**: Success message

### Get Reservations by Guest
```
GET /api/v1/reservations/guest/:guestID
```
**Response**: List of all reservations for guest

### Get Reservations by Room
```
GET /api/v1/reservations/room/:roomID
```
**Response**: List of all reservations for room

## Business Logic

### Reservation Creation Flow
1. Validate guest exists
2. Validate room exists and is available
3. Check room availability for date range
4. Calculate number of nights
5. Calculate total price (room rate × nights)
6. Create reservation with "pending" status
7. Reserve the room
8. Return created reservation

### Reservation Confirmation Flow
1. Verify payment received
2. Update status to "confirmed"
3. Send confirmation email to guest
4. Update room status to "reserved"
5. Create check-in reminder

### Reservation Check-In Flow
1. Verify reservation exists
2. Verify guest identity
3. Update status to "checked-in"
4. Update room status to "occupied"
5. Create check-in record
6. Issue room key
7. Provide welcome information

### Reservation Check-Out Flow
1. Verify reservation exists
2. Calculate additional charges
3. Process payment if needed
4. Update status to "checked-out"
5. Update room status to "cleaning"
6. Create check-out record
7. Schedule housekeeping

### Reservation Cancellation Flow
1. Verify reservation can be cancelled
2. Calculate refund amount
3. Process refund
4. Update status to "cancelled"
5. Release room reservation
6. Send cancellation confirmation

## Data Validation

### Reservation Creation Validation
- Guest ID: Required, must exist
- Room ID: Required, must exist
- Check-in Date: Required, cannot be in past
- Check-out Date: Required, must be after check-in
- Total Price: Required, must be positive
- Room must be available for entire date range

### Reservation Update Validation
- Status: Must be valid status value
- Total Price: Must be positive if updated
- Check-in/Check-out: Cannot be changed after check-in

## Response Examples

### Create Reservation Response
```json
{
    "success": true,
    "message": "Reservation created successfully",
    "data": {
        "id": 1,
        "booking_id": "BK-12345",
        "guest_id": 1,
        "room_id": 5,
        "check_in_date": "2024-12-15T14:00:00Z",
        "check_out_date": "2024-12-18T11:00:00Z",
        "nights": 3,
        "total_price": 450.00,
        "paid_amount": 0.00,
        "status": "pending",
        "created_at": "2024-12-05T10:00:00Z",
        "updated_at": "2024-12-05T10:00:00Z"
    }
}
```

### Get Reservation by ID Response
```json
{
    "success": true,
    "message": "Reservation retrieved successfully",
    "data": {
        "id": 1,
        "booking_id": "BK-12345",
        "guest": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890"
        },
        "room": {
            "id": 5,
            "room_number": "305",
            "room_type": "Deluxe",
            "floor": 3,
            "price_per_night": 150.00
        },
        "check_in_date": "2024-12-15T14:00:00Z",
        "check_out_date": "2024-12-18T11:00:00Z",
        "check_in_time": "14:00",
        "check_out_time": "11:00",
        "nights": 3,
        "total_price": 450.00,
        "paid_amount": 450.00,
        "status": "confirmed",
        "preferences": [
            "Vegetarian meals",
            "Ground floor preferred",
            "Extra pillows"
        ],
        "service_requests": [],
        "created_at": "2024-12-05T10:00:00Z",
        "updated_at": "2024-12-05T10:00:00Z"
    }
}
```

### Reservations List Response
```json
{
    "success": true,
    "message": "Reservations retrieved successfully",
    "data": [
        {
            "id": 1,
            "booking_id": "BK-12345",
            "guest_id": 1,
            "room_id": 5,
            "check_in_date": "2024-12-15T14:00:00Z",
            "check_out_date": "2024-12-18T11:00:00Z",
            "nights": 3,
            "total_price": 450.00,
            "paid_amount": 450.00,
            "status": "confirmed",
            "created_at": "2024-12-05T10:00:00Z",
            "updated_at": "2024-12-05T10:00:00Z"
        }
    ],
    "meta": {
        "page": 1,
        "page_size": 10,
        "total": 250,
        "total_pages": 25
    }
}
```

## Status Lifecycle

```
pending → confirmed → checked-in → checked-out
   ↓
cancelled
```

### Status Descriptions
- **pending**: Reservation created, awaiting confirmation
- **confirmed**: Payment received, reservation confirmed
- **checked-in**: Guest has checked in
- **checked-out**: Guest has checked out
- **cancelled**: Reservation cancelled

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Reservation, guest, or room not found
- **409 Conflict**: Room not available for dates
- **422 Unprocessable Entity**: Invalid status transition
- **500 Internal Server Error**: Database error

### Error Response Examples
```json
{
    "success": false,
    "message": "Failed to create reservation",
    "error": "Room not available for selected dates"
}
```

## Performance Optimization

### Database Indexes
- BookingID (unique)
- GuestID
- RoomID
- CheckInDate
- CheckOutDate
- Status

### Query Optimization
- Use pagination for reservation lists
- Preload guest and room only when needed
- Create database view for availability checking
- Cache availability calendar (1 hour TTL)

### Caching Strategy
- Cache room availability (1 hour TTL)
- Cache guest reservations (30 minutes TTL)
- Cache reservation details (1 hour TTL)

## Integration Points

### With Guest Module
- Fetch guest information on reservation creation
- Update guest statistics on check-out
- Link reservations to guest profile

### With Room Module
- Check room availability
- Update room status
- Track room occupancy

### With Service Request Module
- Link service requests to reservations
- Track services used during stay
- Generate service usage statistics

### With Check-In/Check-Out Module
- Create check-in records
- Create check-out records
- Track check-in/out times

### With Dashboard Module
- Provide reservation statistics
- Calculate occupancy rate
- Track revenue

## Future Enhancements

1. **Advanced Availability**
   - Real-time availability checking
   - Dynamic pricing
   - Overbooking management

2. **Payment Integration**
   - Multiple payment methods
   - Partial payments
   - Refund management

3. **Notifications**
   - Pre-arrival emails
   - Check-in reminders
   - Post-stay surveys

4. **Reporting**
   - Occupancy reports
   - Revenue reports
   - Guest satisfaction reports
