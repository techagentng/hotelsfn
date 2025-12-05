# Check-In / Check-Out Management Module

## Overview
The Check-In/Check-Out Module manages guest arrival and departure processes, including verification, key management, and document handling.

## Database Models

### CheckIn
```go
type CheckIn struct {
    ID              uint      // Primary key
    ReservationID   uint      // Foreign key to Reservation (unique)
    GuestID         uint      // Foreign key to Guest
    RoomID          uint      // Foreign key to Room
    CheckInTime     time.Time // Actual check-in time
    IDVerified      bool      // ID verification status
    KeyIssued       bool      // Key issuance status
    DocumentsSigned bool      // Documents signed status
    Notes           string    // Additional notes
    CreatedAt       time.Time
    UpdatedAt       time.Time
    
    // Relations
    Reservation Reservation
    Guest       Guest
    Room        Room
}
```

### CheckOut
```go
type CheckOut struct {
    ID            uint      // Primary key
    ReservationID uint      // Foreign key to Reservation (unique)
    GuestID       uint      // Foreign key to Guest
    RoomID        uint      // Foreign key to Room
    CheckOutTime  time.Time // Actual check-out time
    RoomCondition string    // excellent, good, fair, poor
    Charges       float64   // Additional charges
    Notes         string    // Additional notes
    CreatedAt     time.Time
    UpdatedAt     time.Time
    
    // Relations
    Reservation Reservation
    Guest       Guest
    Room        Room
}
```

## API Endpoints

### Check-In Endpoints

#### Get All Check-Ins
```
GET /api/v1/check-ins?page=1&page_size=10
```
**Response**: Paginated list of check-ins

#### Get Check-In by ID
```
GET /api/v1/check-ins/:id
```
**Response**: Complete check-in details

#### Create Check-In (Manual Check-In)
```
POST /api/v1/check-ins
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "room_id": 5,
    "id_verified": true,
    "key_issued": true,
    "documents_signed": true,
    "notes": "Guest prefers quiet room"
}
```
**Response**: Created check-in record

#### Update Check-In
```
PUT /api/v1/check-ins/:id
Content-Type: application/json

{
    "id_verified": true,
    "key_issued": true,
    "documents_signed": true,
    "notes": "Updated notes"
}
```
**Response**: Updated check-in record

#### Get Check-In by Reservation
```
GET /api/v1/check-ins/reservation/:reservationID
```
**Response**: Check-in record for reservation

### Check-Out Endpoints

#### Get All Check-Outs
```
GET /api/v1/check-outs?page=1&page_size=10
```
**Response**: Paginated list of check-outs

#### Get Check-Out by ID
```
GET /api/v1/check-outs/:id
```
**Response**: Complete check-out details

#### Create Check-Out
```
POST /api/v1/check-outs
Content-Type: application/json

{
    "reservation_id": 1,
    "guest_id": 1,
    "room_id": 5,
    "room_condition": "good",
    "charges": 0.00,
    "notes": "Guest satisfied with stay"
}
```
**Response**: Created check-out record

#### Update Check-Out
```
PUT /api/v1/check-outs/:id
Content-Type: application/json

{
    "room_condition": "excellent",
    "charges": 50.00,
    "notes": "Mini bar charges added"
}
```
**Response**: Updated check-out record

#### Get Check-Out by Reservation
```
GET /api/v1/check-outs/reservation/:reservationID
```
**Response**: Check-out record for reservation

## Business Logic

### Manual Check-In Flow

#### Step 1: Search Booking
1. Guest/Staff enters booking ID
2. System searches for reservation
3. Verify reservation exists and status is "confirmed"
4. Return reservation details

#### Step 2: Verify Guest Information
1. Display guest details:
   - Name
   - Email
   - Phone
   - Room number
2. Verify guest identity (ID check)
3. Collect verification checklist:
   - ID Verified ✓
   - Key Issued ✓
   - Documents Signed ✓
4. Allow notes entry

#### Step 3: Complete Check-In
1. Review summary
2. Confirm all verifications
3. Create check-in record
4. Update reservation status to "checked-in"
5. Update room status to "occupied"
6. Issue room key
7. Provide welcome information
8. Send confirmation to guest
9. Return success message

### Automatic Check-In Flow
1. Verify reservation exists
2. Verify guest identity
3. Perform all verifications
4. Create check-in record
5. Update statuses
6. Return check-in confirmation

### Check-Out Flow
1. Verify reservation exists
2. Verify guest is checking out
3. Inspect room condition
4. Calculate additional charges
5. Process payment if needed
6. Create check-out record
7. Update reservation status to "checked-out"
8. Update room status to "cleaning"
9. Schedule housekeeping
10. Send checkout confirmation
11. Request feedback

### Room Condition Assessment
- **Excellent**: No damage, clean, all items present
- **Good**: Minor wear, clean, all items present
- **Fair**: Some damage, needs cleaning, minor items missing
- **Poor**: Significant damage, needs deep clean, items missing

## Data Validation

### Check-In Validation
- Reservation ID: Required, must exist, status must be "confirmed"
- Guest ID: Required, must exist, must match reservation
- Room ID: Required, must exist, must match reservation
- ID Verified: Boolean
- Key Issued: Boolean
- Documents Signed: Boolean

### Check-Out Validation
- Reservation ID: Required, must exist, status must be "checked-in"
- Guest ID: Required, must exist, must match reservation
- Room ID: Required, must exist, must match reservation
- Room Condition: Required, valid condition value
- Charges: Optional, must be non-negative

## Response Examples

### Create Check-In Response
```json
{
    "success": true,
    "message": "Check-in completed successfully",
    "data": {
        "id": 1,
        "reservation_id": 1,
        "guest_id": 1,
        "room_id": 5,
        "check_in_time": "2024-12-15T14:30:00Z",
        "id_verified": true,
        "key_issued": true,
        "documents_signed": true,
        "notes": "Guest prefers quiet room",
        "created_at": "2024-12-15T14:30:00Z",
        "updated_at": "2024-12-15T14:30:00Z"
    }
}
```

### Manual Check-In Step 1 Response (Search)
```json
{
    "success": true,
    "message": "Reservation found",
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
            "room_type": "Deluxe"
        },
        "check_in_date": "2024-12-15T00:00:00Z",
        "check_out_date": "2024-12-18T00:00:00Z",
        "status": "confirmed"
    }
}
```

### Manual Check-In Step 2 Response (Verify)
```json
{
    "success": true,
    "message": "Guest information verified",
    "data": {
        "guest_name": "John Doe",
        "guest_email": "john@example.com",
        "guest_phone": "+1234567890",
        "room_number": "305",
        "verification_checklist": {
            "id_verified": false,
            "key_issued": false,
            "documents_signed": false
        }
    }
}
```

### Create Check-Out Response
```json
{
    "success": true,
    "message": "Check-out completed successfully",
    "data": {
        "id": 1,
        "reservation_id": 1,
        "guest_id": 1,
        "room_id": 5,
        "check_out_time": "2024-12-18T10:45:00Z",
        "room_condition": "good",
        "charges": 0.00,
        "notes": "Guest satisfied with stay",
        "created_at": "2024-12-18T10:45:00Z",
        "updated_at": "2024-12-18T10:45:00Z"
    }
}
```

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Reservation, guest, or room not found
- **409 Conflict**: Invalid reservation status, already checked in/out
- **422 Unprocessable Entity**: Invalid room condition
- **500 Internal Server Error**: Database error

### Error Response Examples
```json
{
    "success": false,
    "message": "Failed to check in",
    "error": "Reservation not found or not confirmed"
}
```

## Performance Optimization

### Database Indexes
- ReservationID (unique)
- GuestID
- RoomID
- CheckInTime
- CheckOutTime

### Query Optimization
- Use pagination for lists
- Preload relations selectively
- Create database view for pending check-ins/outs
- Cache reservation details during check-in process

## Integration Points

### With Reservation Module
- Update reservation status
- Verify reservation details
- Link check-in/out to reservation

### With Room Module
- Update room status
- Schedule housekeeping
- Track room occupancy

### With Guest Module
- Verify guest identity
- Update guest statistics
- Track guest preferences

### With Service Request Module
- Link service requests to check-in
- Track services during stay

### With Dashboard Module
- Provide check-in/out statistics
- Track pending check-ins/outs
- Calculate occupancy

## Manual Check-In Modal Features

### Step 1: Search Booking
- Input field for booking ID
- Search button
- Error handling for invalid bookings
- Display found reservation details

### Step 2: Verify Guest Information
- Display guest name, email, phone
- Display room number
- Verification checklist:
  - ID Verified checkbox
  - Key Issued checkbox
  - Documents Signed checkbox
- Notes textarea
- Back/Continue buttons

### Step 3: Complete Check-In
- Green summary box with guest details
- Blue verification status box
- Additional notes field
- Back button to edit
- Green "Complete Check-In" button
- Success notification

## Future Enhancements

1. **Digital Check-In**
   - Mobile app check-in
   - QR code scanning
   - Biometric verification

2. **Automated Processes**
   - Self-service kiosks
   - Mobile key delivery
   - Digital documents

3. **Integration**
   - Payment processing
   - Loyalty program enrollment
   - Email/SMS notifications

4. **Analytics**
   - Check-in time tracking
   - Peak hours analysis
   - Guest satisfaction metrics

5. **Compliance**
   - Document archiving
   - Audit trails
   - Regulatory compliance
