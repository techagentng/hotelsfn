# Hotel Management System - Backend Architecture

## Overview
This document outlines the complete backend architecture for the hotel management system built with Go, GORM, and Gin.

## Technology Stack
- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **ORM**: GORM
- **Database**: PostgreSQL (recommended)
- **Authentication**: JWT (to be implemented)
- **API Version**: v1

## Project Structure

```
backend/
├── models/
│   └── models.go              # All database models
├── handlers/
│   ├── handlers.go            # Main handler implementations
│   ├── guest_handlers.go      # Guest-related handlers
│   ├── reservation_handlers.go # Reservation handlers
│   ├── room_handlers.go       # Room management handlers
│   ├── service_handlers.go    # Service request handlers
│   ├── checkin_handlers.go    # Check-in/out handlers
│   └── dashboard_handlers.go  # Dashboard statistics
├── routes/
│   └── routes.go              # Route definitions
├── responses/
│   └── responses.go           # Response structures
├── middleware/
│   ├── auth.go                # Authentication middleware
│   └── error.go               # Error handling middleware
├── config/
│   └── config.go              # Configuration management
├── database/
│   └── database.go            # Database initialization
├── utils/
│   ├── validators.go          # Input validation
│   └── helpers.go             # Helper functions
├── main.go                    # Application entry point
├── go.mod                     # Go module file
├── go.sum                     # Go dependencies
└── README.md                  # Backend setup guide
```

## Core Modules

### 1. **Guest Management Module**
- Guest CRUD operations
- Guest preferences management
- AI insights generation
- Guest history tracking

### 2. **Reservation Module**
- Booking creation and management
- Reservation status tracking
- Check-in/check-out management
- Reservation timeline

### 3. **Room Management Module**
- Room inventory management
- Room status tracking
- Room availability checking
- Room type management

### 4. **Service Request Module**
- Room service orders
- Housekeeping requests
- Maintenance issue reporting
- General assistance requests

### 5. **Check-In/Check-Out Module**
- Manual check-in processing
- Check-out management
- Document verification
- Key management

### 6. **Dashboard Module**
- Real-time statistics
- Room status summary
- Service request tracking
- Revenue analytics

### 7. **In-Room Tablet Module**
- Guest-facing service interface
- Real-time reservation display
- Service request submission
- Order placement

## API Endpoints Structure

All endpoints follow RESTful conventions under `/api/v1/` prefix.

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "error": null
}
```

### Pagination Format
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

## Database Relationships

```
Guest
├── Reservations (1:N)
├── ServiceRequests (1:N)
├── Preferences (1:1)
└── AIInsights (1:1)

Reservation
├── Guest (N:1)
├── Room (N:1)
├── ServiceRequests (1:N)
├── CheckIn (1:1)
└── CheckOut (1:1)

Room
├── Reservations (1:N)
└── MaintenanceIssues (1:N)

ServiceRequest
├── Reservation (N:1)
└── Guest (N:1)
```

## Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Roles: Admin, Manager, Staff, Guest

## Error Handling
- Standardized error responses
- HTTP status codes
- Error logging
- Request validation

## Performance Considerations
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching strategies for static data
- Connection pooling

## Security Measures
- Input validation and sanitization
- SQL injection prevention (via GORM)
- CORS configuration
- Rate limiting
- JWT token expiration

## Deployment
- Docker containerization
- Environment configuration
- Database migrations
- Health check endpoints

## Testing
- Unit tests for handlers
- Integration tests for database operations
- API endpoint testing
- Load testing considerations

## Documentation
- Swagger/OpenAPI documentation
- API endpoint documentation
- Database schema documentation
- Setup and deployment guides
