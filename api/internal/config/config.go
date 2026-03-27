package config

import (
	"fmt"
	"os"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBName     string
	DBUser     string
	DBPassword string
	AppPort    string
	JWTSecret  string
	AuthCookieName string
	AuthCookieSecure bool
	GoogleClientID          string
	GoogleClientSecret      string
	GoogleRefreshToken      string
	GoogleCalendarID        string
	GoogleCalendarTimeZone  string
}

func Load() *Config {
	return &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBName:     getEnv("DB_NAME", "eventleaf_db"),
		DBUser:     getEnv("DB_USER", "eventleaf_user"),
		DBPassword: getEnv("DB_PASSWORD", "eventleaf_password"),
		AppPort:    getEnv("APP_PORT", "3000"),
		JWTSecret:  getEnv("JWT_SECRET", "dev-insecure-secret-change-me"),
		AuthCookieName: getEnv("AUTH_COOKIE_NAME", "eventleaf_session"),
		AuthCookieSecure: getEnv("AUTH_COOKIE_SECURE", "true") != "false",
		GoogleClientID:         getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:     getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRefreshToken:     getEnv("GOOGLE_REFRESH_TOKEN", ""),
		GoogleCalendarID:       getEnv("GOOGLE_CALENDAR_ID", "primary"),
		GoogleCalendarTimeZone: getEnv("GOOGLE_CALENDAR_TIMEZONE", "America/New_York"),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
