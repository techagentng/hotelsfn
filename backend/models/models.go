package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Guest represents a hotel guest
type Guest struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `json:"name"`
	Email       string         `gorm:"uniqueIndex" json:"email"`
	Phone       string         `json:"phone"`
	Nationality string         `json:"nationality"`
	IDType      string         `json:"id_type"` // Passport, Driver's License, etc.
	IDNumber    string         `json:"id_number"`
	JoinDate    time.Time      `json:"join_date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`

	// Relations
	Reservations     []Reservation     `gorm:"foreignKey:GuestID" json:"reservations,omitempty"`
	ServiceRequests  []ServiceRequest  `gorm:"foreignKey:GuestID" json:"service_requests,omitempty"`
	Preferences      GuestPreferences  `gorm:"foreignKey:GuestID" json:"preferences,omitempty"`
	AIInsights       GuestAIInsights   `gorm:"foreignKey:GuestID" json:"ai_insights,omitempty"`
}

// GuestPreferences stores guest preferences
type GuestPreferences struct {
	ID               uint            `gorm:"primaryKey" json:"id"`
	GuestID          uint            `gorm:"uniqueIndex" json:"guest_id"`
	RoomFloors       datatypes.JSONSlice `gorm:"type:jsonb" json:"room_floors"`
	MealTypes        datatypes.JSONSlice `gorm:"type:jsonb" json:"meal_types"`
	RoomTypes        datatypes.JSONSlice `gorm:"type:jsonb" json:"room_types"`
	SpecialRequests  datatypes.JSONSlice `gorm:"type:jsonb" json:"special_requests"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

// GuestAIInsights stores AI-generated insights about guests
type GuestAIInsights struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	GuestID             uint      `gorm:"uniqueIndex" json:"guest_id"`
	MealPreference      string    `json:"meal_preference"`
	RoomPreference      string    `json:"room_preference"`
	ServicePattern      string    `json:"service_pattern"`
	RiskScore           string    `json:"risk_score"` // low, medium, high
	Recommendations     datatypes.JSONSlice `gorm:"type:jsonb" json:"recommendations"`
	Complaints          datatypes.JSONSlice `gorm:"type:jsonb" json:"complaints"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// Room represents a hotel room
type Room struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	RoomNumber    string    `gorm:"uniqueIndex" json:"room_number"`
	RoomType      string    `json:"room_type"` // Standard, Deluxe, Suite
	Floor         int       `json:"floor"`
	Capacity      int       `json:"capacity"`
	PricePerNight float64   `json:"price_per_night"`
	Status        string    `json:"status"` // available, occupied, maintenance, cleaning
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservations []Reservation `gorm:"foreignKey:RoomID" json:"reservations,omitempty"`
}

// Reservation represents a booking
type Reservation struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	BookingID     string    `gorm:"uniqueIndex" json:"booking_id"`
	GuestID       uint      `json:"guest_id"`
	RoomID        uint      `json:"room_id"`
	CheckInDate   time.Time `json:"check_in_date"`
	CheckOutDate  time.Time `json:"check_out_date"`
	Nights        int       `json:"nights"`
	TotalPrice    float64   `json:"total_price"`
	PaidAmount    float64   `json:"paid_amount"`
	Status        string    `json:"status"` // pending, confirmed, checked-in, checked-out, cancelled
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Guest         Guest              `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
	Room          Room               `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	ServiceRequests []ServiceRequest `gorm:"foreignKey:ReservationID" json:"service_requests,omitempty"`
}

// ServiceRequest represents a guest service request
type ServiceRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ReservationID uint      `json:"reservation_id"`
	GuestID       uint      `json:"guest_id"`
	ServiceType   string    `json:"service_type"` // room-service, housekeeping, maintenance, special-requests, transportation, general-assistance
	Status        string    `json:"status"` // pending, in-progress, completed, cancelled
	Priority      string    `json:"priority"` // low, medium, high
	Description   string    `gorm:"type:text" json:"description"`
	Notes         string    `gorm:"type:text" json:"notes"`
	AssignedTo    string    `json:"assigned_to"`
	RequestedAt   time.Time `json:"requested_at"`
	CompletedAt   *time.Time `json:"completed_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservation Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	Guest       Guest       `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
}

// RoomServiceOrder represents a room service order
type RoomServiceOrder struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	OrderID       string    `gorm:"uniqueIndex" json:"order_id"`
	ReservationID uint      `json:"reservation_id"`
	GuestID       uint      `json:"guest_id"`
	Items         datatypes.JSONSlice `gorm:"type:jsonb" json:"items"`
	Subtotal      float64   `json:"subtotal"`
	DeliveryFee   float64   `json:"delivery_fee"`
	Total         float64   `json:"total"`
	Status        string    `json:"status"` // pending, preparing, delivered, cancelled
	SpecialNotes  string    `gorm:"type:text" json:"special_notes"`
	OrderedAt     time.Time `json:"ordered_at"`
	DeliveredAt   *time.Time `json:"delivered_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservation Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	Guest       Guest       `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
}

// HousekeepingRequest represents a housekeeping service request
type HousekeepingRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ReservationID uint      `json:"reservation_id"`
	GuestID       uint      `json:"guest_id"`
	RequestType   string    `json:"request_type"` // cleaning, linens, schedule
	Description   string    `gorm:"type:text" json:"description"`
	ScheduleTime  string    `json:"schedule_time"` // morning, afternoon, immediate
	Status        string    `json:"status"` // pending, in-progress, completed
	AssignedTo    string    `json:"assigned_to"`
	RequestedAt   time.Time `json:"requested_at"`
	CompletedAt   *time.Time `json:"completed_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservation Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	Guest       Guest       `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
}

// MaintenanceIssue represents a maintenance issue report
type MaintenanceIssue struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ReservationID uint      `json:"reservation_id"`
	GuestID       uint      `json:"guest_id"`
	IssueType     string    `json:"issue_type"` // ac, tv, wifi, plumbing, lights, door-lock, noise, other
	Description   string    `gorm:"type:text" json:"description"`
	Status        string    `json:"status"` // reported, in-progress, resolved
	Priority      string    `json:"priority"` // low, medium, high
	AssignedTo    string    `json:"assigned_to"`
	ReportedAt    time.Time `json:"reported_at"`
	ResolvedAt    *time.Time `json:"resolved_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservation Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	Guest       Guest       `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
}

// MenuItem represents a room service menu item
type MenuItem struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Price       float64   `json:"price"`
	Category    string    `json:"category"` // Food, Drinks
	Available   bool      `json:"available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Staff represents hotel staff members
type Staff struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Phone     string    `json:"phone"`
	Role      string    `json:"role"` // manager, housekeeping, maintenance, front-desk, room-service
	Status    string    `json:"status"` // active, inactive
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CheckIn represents a guest check-in record
type CheckIn struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ReservationID uint      `gorm:"uniqueIndex" json:"reservation_id"`
	GuestID       uint      `json:"guest_id"`
	RoomID        uint      `json:"room_id"`
	CheckInTime   time.Time `json:"check_in_time"`
	IDVerified    bool      `json:"id_verified"`
	KeyIssued     bool      `json:"key_issued"`
	DocumentsSigned bool    `json:"documents_signed"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservation Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	Guest       Guest       `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
	Room        Room        `gorm:"foreignKey:RoomID" json:"room,omitempty"`
}

// CheckOut represents a guest check-out record
type CheckOut struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ReservationID uint      `gorm:"uniqueIndex" json:"reservation_id"`
	GuestID       uint      `json:"guest_id"`
	RoomID        uint      `json:"room_id"`
	CheckOutTime  time.Time `json:"check_out_time"`
	RoomCondition string    `json:"room_condition"` // excellent, good, fair, poor
	Charges       float64   `json:"charges"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relations
	Reservation Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	Guest       Guest       `gorm:"foreignKey:GuestID" json:"guest,omitempty"`
	Room        Room        `gorm:"foreignKey:RoomID" json:"room,omitempty"`
}
