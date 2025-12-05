# Guest Management Module

## Overview
The Guest Management Module handles all guest-related operations including profile management, preferences, AI insights, and guest history tracking.

## Database Models

### Guest
```go
type Guest struct {
    ID          uint           // Primary key
    Name        string         // Guest full name
    Email       string         // Unique email address
    Phone       string         // Contact phone number
    Nationality string         // Guest nationality
    IDType      string         // Passport, Driver's License, etc.
    IDNumber    string         // ID document number
    JoinDate    time.Time      // When guest joined
    CreatedAt   time.Time      // Record creation timestamp
    UpdatedAt   time.Time      // Record update timestamp
    
    // Relations
    Reservations    []Reservation
    ServiceRequests []ServiceRequest
    Preferences     GuestPreferences
    AIInsights      GuestAIInsights
}
```

### GuestPreferences
```go
type GuestPreferences struct {
    ID              uint                // Primary key
    GuestID         uint                // Foreign key to Guest
    RoomFloors      []string            // Preferred floor levels
    MealTypes       []string            // Dietary preferences
    RoomTypes       []string            // Preferred room types
    SpecialRequests []string            // Special requests history
    CreatedAt       time.Time
    UpdatedAt       time.Time
}
```

### GuestAIInsights
```go
type GuestAIInsights struct {
    ID              uint                // Primary key
    GuestID         uint                // Foreign key to Guest
    MealPreference  string              // AI-analyzed meal preference
    RoomPreference  string              // AI-analyzed room preference
    ServicePattern  string              // Service usage pattern
    RiskScore       string              // low, medium, high
    Recommendations []string            // AI recommendations
    Complaints      []string            // Historical complaints
    CreatedAt       time.Time
    UpdatedAt       time.Time
}
```

## API Endpoints

### Get All Guests
```
GET /api/v1/guests?page=1&page_size=10
```
**Response**: Paginated list of guests

### Get Guest by ID
```
GET /api/v1/guests/:id
```
**Response**: Complete guest profile with relations

### Create Guest
```
POST /api/v1/guests
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "nationality": "United States",
    "id_type": "Passport",
    "id_number": "US123456789"
}
```
**Response**: Created guest object

### Update Guest
```
PUT /api/v1/guests/:id
Content-Type: application/json

{
    "name": "John Doe Updated",
    "phone": "+1234567891"
}
```
**Response**: Updated guest object

### Delete Guest
```
DELETE /api/v1/guests/:id
```
**Response**: Success message

### Get Guest History
```
GET /api/v1/guests/:id/history
```
**Response**: List of all reservations for guest

### Get Guest Preferences
```
GET /api/v1/guests/:id/preferences
```
**Response**: Guest preferences object

### Get Guest AI Insights
```
GET /api/v1/guests/:id/ai-insights
```
**Response**: AI insights object

## Business Logic

### Guest Creation Flow
1. Validate input data
2. Check for duplicate email
3. Create guest record
4. Initialize empty preferences
5. Generate initial AI insights
6. Return created guest

### Guest Profile Enrichment
1. Analyze reservation history
2. Track service usage patterns
3. Identify meal preferences
4. Calculate risk score
5. Generate recommendations
6. Update AI insights

### Guest History Compilation
1. Fetch all reservations
2. Calculate statistics:
   - Total stays
   - Total spent
   - Average spend
   - Last visit date
   - Most common room
3. Aggregate service requests
4. Compile preferences
5. Return comprehensive profile

## Data Validation

### Guest Creation Validation
- Name: Required, min 2 characters, max 100 characters
- Email: Required, valid email format, unique
- Phone: Required, valid phone format
- Nationality: Required, valid country code
- ID Type: Required, valid ID type
- ID Number: Required, unique per guest

### Guest Update Validation
- All fields optional
- Email must be unique if updated
- Phone must be valid format if updated

## Response Examples

### Get Guest by ID Response
```json
{
    "success": true,
    "message": "Guest retrieved successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "nationality": "United States",
        "id_type": "Passport",
        "id_number": "US123456789",
        "join_date": "2023-01-15T00:00:00Z",
        "reservations": [
            {
                "id": 1,
                "booking_id": "BK-001",
                "check_in_date": "2024-12-01T00:00:00Z",
                "check_out_date": "2024-12-05T00:00:00Z",
                "nights": 4,
                "total_price": 400,
                "status": "completed"
            }
        ],
        "preferences": {
            "id": 1,
            "room_floors": ["1st Floor", "2nd Floor"],
            "meal_types": ["Vegetarian", "Vegan"],
            "room_types": ["Standard", "Deluxe"],
            "special_requests": ["Extra pillows", "Late checkout"]
        },
        "ai_insights": {
            "id": 1,
            "meal_preference": "Usually orders vegetarian meals",
            "room_preference": "Prefers rooms on 1st or 2nd floor",
            "service_pattern": "Frequently uses room service",
            "risk_score": "low",
            "recommendations": [
                "Offer vegetarian menu at check-in",
                "Prioritize ground floor rooms"
            ],
            "complaints": []
        },
        "created_at": "2023-01-15T00:00:00Z",
        "updated_at": "2024-12-05T00:00:00Z"
    }
}
```

### Guest List Response
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

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Guest not found
- **409 Conflict**: Duplicate email address
- **500 Internal Server Error**: Database error

### Error Response Format
```json
{
    "success": false,
    "message": "Failed to create guest",
    "error": "Email already exists"
}
```

## Performance Optimization

### Database Indexes
- Email (unique)
- Phone
- Nationality
- JoinDate

### Query Optimization
- Use pagination for guest lists
- Preload relations only when needed
- Cache AI insights (update daily)
- Use database views for statistics

### Caching Strategy
- Cache guest preferences (1 hour TTL)
- Cache AI insights (24 hour TTL)
- Cache guest statistics (1 hour TTL)

## Integration Points

### With Reservation Module
- Fetch guest on reservation creation
- Update guest statistics on check-out
- Link reservations to guest profile

### With Service Request Module
- Track service usage per guest
- Update preferences based on requests
- Generate insights from service patterns

### With Dashboard Module
- Provide guest statistics
- Calculate guest lifetime value
- Track guest satisfaction metrics

## Future Enhancements

1. **Advanced AI Analysis**
   - Machine learning for preference prediction
   - Sentiment analysis from feedback
   - Churn prediction

2. **Guest Communication**
   - Email notifications
   - SMS alerts
   - Push notifications

3. **Loyalty Program**
   - Points tracking
   - Tier management
   - Rewards integration

4. **Guest Segmentation**
   - VIP guest classification
   - Behavioral segmentation
   - Personalized offers
