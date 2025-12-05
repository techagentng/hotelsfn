# Room Management Module

## Overview
The Room Management Module handles room inventory, status tracking, availability management, and room configuration.

## Database Models

### Room
```go
type Room struct {
    ID            uint      // Primary key
    RoomNumber    string    // Unique room number (e.g., "305")
    RoomType      string    // Standard, Deluxe, Suite
    Floor         int       // Floor number
    Capacity      int       // Maximum guests
    PricePerNight float64   // Nightly rate
    Status        string    // available, occupied, maintenance, cleaning
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Reservations []Reservation
}
```

## API Endpoints

### Get All Rooms
```
GET /api/v1/rooms?page=1&page_size=10&status=available
```
**Query Parameters**:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10)
- `status`: Filter by status (optional)

**Response**: Paginated list of rooms

### Get Room by ID
```
GET /api/v1/rooms/:id
```
**Response**: Complete room details

### Create Room
```
POST /api/v1/rooms
Content-Type: application/json

{
    "room_number": "305",
    "room_type": "Deluxe",
    "floor": 3,
    "capacity": 2,
    "price_per_night": 150.00
}
```
**Response**: Created room

### Update Room
```
PUT /api/v1/rooms/:id
Content-Type: application/json

{
    "price_per_night": 160.00,
    "capacity": 3
}
```
**Response**: Updated room

### Delete Room
```
DELETE /api/v1/rooms/:id
```
**Response**: Success message

### Get Available Rooms
```
GET /api/v1/rooms/available?check_in=2024-12-15&check_out=2024-12-18&room_type=Deluxe
```
**Query Parameters**:
- `check_in`: Check-in date (required)
- `check_out`: Check-out date (required)
- `room_type`: Filter by room type (optional)

**Response**: List of available rooms

### Update Room Status
```
PUT /api/v1/rooms/:id/status
Content-Type: application/json

{
    "status": "maintenance"
}
```
**Response**: Updated room

## Room Status Lifecycle

```
available → occupied → available
   ↓
maintenance → available
   ↓
cleaning → available
```

### Status Descriptions
- **available**: Room is clean and ready for guests
- **occupied**: Guest is currently in the room
- **maintenance**: Room requires maintenance
- **cleaning**: Room is being cleaned

## Business Logic

### Room Creation Flow
1. Validate room number is unique
2. Validate room type
3. Validate floor number
4. Validate capacity
5. Validate price per night
6. Create room with "available" status
7. Return created room

### Room Availability Check Flow
1. Get check-in and check-out dates
2. Query reservations for date range
3. Exclude cancelled reservations
4. Return available rooms
5. Filter by room type if specified
6. Sort by price

### Room Status Update Flow
1. Validate room exists
2. Validate new status
3. Validate status transition
4. Update room status
5. If status is "cleaning", schedule housekeeping
6. If status is "maintenance", create maintenance record
7. Return updated room

### Room Occupancy Flow
1. Verify reservation check-in
2. Update room status to "occupied"
3. Record occupancy start time
4. Link room to reservation
5. Update room availability

### Room Checkout Flow
1. Verify reservation check-out
2. Update room status to "cleaning"
3. Record checkout time
4. Schedule housekeeping
5. Calculate stay duration
6. Update room statistics

## Data Validation

### Room Creation Validation
- Room Number: Required, unique, alphanumeric
- Room Type: Required, valid type
- Floor: Required, positive integer
- Capacity: Required, positive integer
- Price Per Night: Required, positive decimal

### Room Update Validation
- All fields optional
- Room Number must be unique if updated
- Price Per Night must be positive if updated
- Capacity must be positive if updated

### Room Status Update Validation
- Status: Required, valid status value
- Status transition must be valid

## Response Examples

### Get All Rooms Response
```json
{
    "success": true,
    "message": "Rooms retrieved successfully",
    "data": [
        {
            "id": 1,
            "room_number": "101",
            "room_type": "Standard",
            "floor": 1,
            "capacity": 2,
            "price_per_night": 100.00,
            "status": "available",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-12-05T00:00:00Z"
        },
        {
            "id": 2,
            "room_number": "102",
            "room_type": "Standard",
            "floor": 1,
            "capacity": 2,
            "price_per_night": 100.00,
            "status": "occupied",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-12-05T10:00:00Z"
        }
    ],
    "meta": {
        "page": 1,
        "page_size": 10,
        "total": 50,
        "total_pages": 5
    }
}
```

### Get Available Rooms Response
```json
{
    "success": true,
    "message": "Available rooms retrieved successfully",
    "data": [
        {
            "id": 1,
            "room_number": "101",
            "room_type": "Standard",
            "floor": 1,
            "capacity": 2,
            "price_per_night": 100.00,
            "status": "available"
        },
        {
            "id": 5,
            "room_number": "305",
            "room_type": "Deluxe",
            "floor": 3,
            "capacity": 2,
            "price_per_night": 150.00,
            "status": "available"
        }
    ]
}
```

### Create Room Response
```json
{
    "success": true,
    "message": "Room created successfully",
    "data": {
        "id": 51,
        "room_number": "501",
        "room_type": "Suite",
        "floor": 5,
        "capacity": 4,
        "price_per_night": 250.00,
        "status": "available",
        "created_at": "2024-12-05T10:00:00Z",
        "updated_at": "2024-12-05T10:00:00Z"
    }
}
```

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Room not found
- **409 Conflict**: Room number already exists, invalid status transition
- **422 Unprocessable Entity**: Invalid room type
- **500 Internal Server Error**: Database error

### Error Response Examples
```json
{
    "success": false,
    "message": "Failed to create room",
    "error": "Room number already exists"
}
```

## Performance Optimization

### Database Indexes
- RoomNumber (unique)
- Status
- RoomType
- Floor

### Query Optimization
- Use pagination for room lists
- Create database view for availability checking
- Cache available rooms (30 minutes TTL)
- Use efficient date range queries

### Caching Strategy
- Cache room list (1 hour TTL)
- Cache available rooms (30 minutes TTL)
- Cache room details (1 hour TTL)
- Invalidate cache on room status change

## Room Types Configuration

### Standard Room
- Capacity: 2 guests
- Price: $100-120 per night
- Amenities: Basic

### Deluxe Room
- Capacity: 2-3 guests
- Price: $150-180 per night
- Amenities: Premium

### Suite
- Capacity: 3-4 guests
- Price: $250-350 per night
- Amenities: Luxury

## Statistics & Reporting

### Room Occupancy Rate
```
Occupied Rooms / Total Rooms × 100%
```

### Room Revenue
```
Total Reservations × Room Price × Nights
```

### Room Utilization
```
Booked Days / Total Days × 100%
```

## Integration Points

### With Reservation Module
- Check room availability
- Update room status on check-in/check-out
- Calculate room revenue

### With Service Request Module
- Track maintenance issues per room
- Schedule housekeeping
- Update room status

### With Dashboard Module
- Provide room statistics
- Calculate occupancy rate
- Track room revenue

## Future Enhancements

1. **Room Features**
   - Room amenities tracking
   - Room photos/gallery
   - Room capacity variations

2. **Dynamic Pricing**
   - Seasonal pricing
   - Demand-based pricing
   - Promotional rates

3. **Maintenance Management**
   - Preventive maintenance scheduling
   - Maintenance history tracking
   - Equipment tracking

4. **Housekeeping Integration**
   - Automated cleaning scheduling
   - Cleaning checklist management
   - Staff assignment optimization

5. **Analytics**
   - Room performance metrics
   - Occupancy forecasting
   - Revenue optimization
