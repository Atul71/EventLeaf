// @title           EventLeaf API
// @version         1.0
// @description     Eco-focused event management API with Green criteria verification
// @host            localhost:3000
// @BasePath        /api/v1

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	_ "github.com/Atul71/EventLeaf/api/docs" // init registers swagger spec
	"github.com/Atul71/EventLeaf/api/internal/config"
	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/Atul71/EventLeaf/api/internal/handler"
	"github.com/Atul71/EventLeaf/api/internal/repository"
	"github.com/Atul71/EventLeaf/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Load .env from project root (parent of api/)
	if envPath, err := filepath.Abs(filepath.Join("..", ".env")); err == nil {
		_ = godotenv.Load(envPath)
	}
	cfg := config.Load()

	ctx := context.Background()
	database, err := db.New(ctx, cfg.DSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	eventRepo := repository.NewEventRepository(database)
	venueRepo := repository.NewVenueRepository(database)
	ecoAttrRepo := repository.NewEcoAttributeRepository(database)
	userRepo := repository.NewUserRepository(database)
	eventHandler := handler.NewEventHandler(eventRepo, venueRepo, ecoAttrRepo)
	googleCalendarRepo := repository.NewGoogleCalendarRepository(database)
	googleCalendarSvc, err := service.NewGoogleCalendarService(
		ctx,
		googleCalendarRepo,
		cfg.GoogleClientID,
		cfg.GoogleClientSecret,
		cfg.GoogleRefreshToken,
		cfg.GoogleCalendarID,
		cfg.GoogleCalendarTimeZone,
	)
	if err != nil {
		log.Fatalf("Failed to initialize Google Calendar service: %v", err)
	}
	eventHandler := handler.NewEventHandler(eventRepo, venueRepo, ecoAttrRepo, googleCalendarSvc, cfg.GoogleCalendarTimeZone)
	venueHandler := handler.NewVenueHandler(venueRepo)
	bootstrapHandler := handler.NewBootstrapHandler(userRepo)

	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Swagger UI at /swagger/index.html
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	v1 := router.Group("/api/v1")
	{
		v1.GET("/events", eventHandler.ListEvents)
		v1.GET("/events/:id", eventHandler.GetEvent)
		v1.POST("/events", eventHandler.CreateEvent)
		v1.GET("/events/:id/calendar.ics", eventHandler.GetEventCalendarICS)
		v1.GET("/eco-attributes", eventHandler.ListEcoAttributes)
		v1.GET("/bootstrap/organizer-id", bootstrapHandler.DemoOrganizerID)

		// Venue CRUD endpoints
		v1.POST("/venues", venueHandler.CreateVenue)
		v1.GET("/venues", venueHandler.ListVenues)
		v1.GET("/venues/:id", venueHandler.GetVenue)
		v1.PUT("/venues/:id", venueHandler.UpdateVenue)
		v1.DELETE("/venues/:id", venueHandler.DeleteVenue)
	}

	srv := &http.Server{
		Addr:    ":" + cfg.AppPort,
		Handler: router,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.AppPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited")
}
