package routes

import (
	"hotel-management/handlers"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine) {
	// Health check
	router.GET("/health", handlers.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Guest routes
		guests := v1.Group("/guests")
		{
			guests.GET("", handlers.GetGuests)
			guests.GET("/:id", handlers.GetGuestByID)
			guests.POST("", handlers.CreateGuest)
			guests.PUT("/:id", handlers.UpdateGuest)
			guests.DELETE("/:id", handlers.DeleteGuest)
			guests.GET("/:id/history", handlers.GetGuestHistory)
			guests.GET("/:id/preferences", handlers.GetGuestPreferences)
			guests.GET("/:id/ai-insights", handlers.GetGuestAIInsights)
		}

		// Reservation routes
		reservations := v1.Group("/reservations")
		{
			reservations.GET("", handlers.GetReservations)
			reservations.GET("/:id", handlers.GetReservationByID)
			reservations.POST("", handlers.CreateReservation)
			reservations.PUT("/:id", handlers.UpdateReservation)
			reservations.DELETE("/:id", handlers.DeleteReservation)
			reservations.GET("/guest/:guestID", handlers.GetReservationsByGuest)
			reservations.GET("/room/:roomID", handlers.GetReservationsByRoom)
		}

		// Room routes
		rooms := v1.Group("/rooms")
		{
			rooms.GET("", handlers.GetRooms)
			rooms.GET("/:id", handlers.GetRoomByID)
			rooms.POST("", handlers.CreateRoom)
			rooms.PUT("/:id", handlers.UpdateRoom)
			rooms.DELETE("/:id", handlers.DeleteRoom)
			rooms.GET("/available", handlers.GetAvailableRooms)
			rooms.PUT("/:id/status", handlers.UpdateRoomStatus)
		}

		// Service Request routes
		serviceRequests := v1.Group("/service-requests")
		{
			serviceRequests.GET("", handlers.GetServiceRequests)
			serviceRequests.GET("/:id", handlers.GetServiceRequestByID)
			serviceRequests.POST("", handlers.CreateServiceRequest)
			serviceRequests.PUT("/:id", handlers.UpdateServiceRequest)
			serviceRequests.DELETE("/:id", handlers.DeleteServiceRequest)
			serviceRequests.GET("/reservation/:reservationID", handlers.GetServiceRequestsByReservation)
			serviceRequests.GET("/guest/:guestID", handlers.GetServiceRequestsByGuest)
			serviceRequests.GET("/status/:status", handlers.GetServiceRequestsByStatus)
		}

		// Room Service Order routes
		roomServiceOrders := v1.Group("/room-service-orders")
		{
			roomServiceOrders.GET("", handlers.GetRoomServiceOrders)
			roomServiceOrders.GET("/:id", handlers.GetRoomServiceOrderByID)
			roomServiceOrders.POST("", handlers.CreateRoomServiceOrder)
			roomServiceOrders.PUT("/:id", handlers.UpdateRoomServiceOrder)
			roomServiceOrders.DELETE("/:id", handlers.DeleteRoomServiceOrder)
			roomServiceOrders.GET("/reservation/:reservationID", handlers.GetRoomServiceOrdersByReservation)
			roomServiceOrders.PUT("/:id/status", handlers.UpdateRoomServiceOrderStatus)
		}

		// Housekeeping Request routes
		housekeepingRequests := v1.Group("/housekeeping-requests")
		{
			housekeepingRequests.GET("", handlers.GetHousekeepingRequests)
			housekeepingRequests.GET("/:id", handlers.GetHousekeepingRequestByID)
			housekeepingRequests.POST("", handlers.CreateHousekeepingRequest)
			housekeepingRequests.PUT("/:id", handlers.UpdateHousekeepingRequest)
			housekeepingRequests.DELETE("/:id", handlers.DeleteHousekeepingRequest)
			housekeepingRequests.GET("/reservation/:reservationID", handlers.GetHousekeepingRequestsByReservation)
			housekeepingRequests.GET("/status/:status", handlers.GetHousekeepingRequestsByStatus)
		}

		// Maintenance Issue routes
		maintenanceIssues := v1.Group("/maintenance-issues")
		{
			maintenanceIssues.GET("", handlers.GetMaintenanceIssues)
			maintenanceIssues.GET("/:id", handlers.GetMaintenanceIssueByID)
			maintenanceIssues.POST("", handlers.CreateMaintenanceIssue)
			maintenanceIssues.PUT("/:id", handlers.UpdateMaintenanceIssue)
			maintenanceIssues.DELETE("/:id", handlers.DeleteMaintenanceIssue)
			maintenanceIssues.GET("/reservation/:reservationID", handlers.GetMaintenanceIssuesByReservation)
			maintenanceIssues.GET("/status/:status", handlers.GetMaintenanceIssuesByStatus)
		}

		// Menu Item routes
		menuItems := v1.Group("/menu-items")
		{
			menuItems.GET("", handlers.GetMenuItems)
			menuItems.GET("/:id", handlers.GetMenuItemByID)
			menuItems.POST("", handlers.CreateMenuItem)
			menuItems.PUT("/:id", handlers.UpdateMenuItem)
			menuItems.DELETE("/:id", handlers.DeleteMenuItem)
			menuItems.GET("/category/:category", handlers.GetMenuItemsByCategory)
		}

		// Check-In routes
		checkIns := v1.Group("/check-ins")
		{
			checkIns.GET("", handlers.GetCheckIns)
			checkIns.GET("/:id", handlers.GetCheckInByID)
			checkIns.POST("", handlers.CreateCheckIn)
			checkIns.PUT("/:id", handlers.UpdateCheckIn)
			checkIns.GET("/reservation/:reservationID", handlers.GetCheckInByReservation)
		}

		// Check-Out routes
		checkOuts := v1.Group("/check-outs")
		{
			checkOuts.GET("", handlers.GetCheckOuts)
			checkOuts.GET("/:id", handlers.GetCheckOutByID)
			checkOuts.POST("", handlers.CreateCheckOut)
			checkOuts.PUT("/:id", handlers.UpdateCheckOut)
			checkOuts.GET("/reservation/:reservationID", handlers.GetCheckOutByReservation)
		}

		// Dashboard routes
		dashboard := v1.Group("/dashboard")
		{
			dashboard.GET("/stats", handlers.GetDashboardStats)
			dashboard.GET("/room-status", handlers.GetRoomStatusSummary)
			dashboard.GET("/service-requests-summary", handlers.GetServiceRequestsSummary)
			dashboard.GET("/revenue", handlers.GetRevenueStats)
		}

		// In-Room Tablet routes
		inRoomTablet := v1.Group("/in-room-tablet")
		{
			inRoomTablet.GET("/reservation/:reservationID", handlers.GetInRoomTabletReservation)
			inRoomTablet.GET("/menu", handlers.GetInRoomTabletMenu)
			inRoomTablet.POST("/room-service-order", handlers.CreateInRoomTabletRoomServiceOrder)
			inRoomTablet.POST("/housekeeping-request", handlers.CreateInRoomTabletHousekeepingRequest)
			inRoomTablet.POST("/maintenance-issue", handlers.CreateInRoomTabletMaintenanceIssue)
		}

		// Staff routes
		staff := v1.Group("/staff")
		{
			staff.GET("", handlers.GetStaff)
			staff.GET("/:id", handlers.GetStaffByID)
			staff.POST("", handlers.CreateStaff)
			staff.PUT("/:id", handlers.UpdateStaff)
			staff.DELETE("/:id", handlers.DeleteStaff)
			staff.GET("/role/:role", handlers.GetStaffByRole)
		}
	}
}
