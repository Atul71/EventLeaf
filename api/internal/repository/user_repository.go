package repository

import (
	"context"
	"errors"

	"github.com/Atul71/EventLeaf/api/internal/db"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type UserRepository struct {
	db *db.DB
}

type CreateUserInput struct {
	Username      string
	Email         string
	PasswordHash  string
	FirstName     string
	LastName      string
	IsOrganizer   bool
	IsEcoConscious bool
}

func NewUserRepository(db *db.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FirstOrganizerID returns the oldest organizer user (for local dev when auth is not wired).
func (r *UserRepository) FirstOrganizerID(ctx context.Context) (uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id FROM users WHERE is_organizer = true ORDER BY created_at ASC LIMIT 1`,
	).Scan(&id)
	return id, err
}

type AuthUser struct {
	ID           uuid.UUID
	Username     string
	Email        string
	PasswordHash string
	IsOrganizer  bool
}

type UserProfile struct {
	ID             uuid.UUID
	Username       string
	Email          string
	FirstName      string
	LastName       string
	Phone          *string
	Bio            *string
	ProfileImageURL *string
	IsOrganizer    bool
	IsEcoConscious bool
}

type UpdateUserProfileInput struct {
	FirstName      string
	LastName       string
	Phone          *string
	Bio            *string
	ProfileImageURL *string
	IsEcoConscious bool
}

func (r *UserRepository) GetAuthUserByEmail(ctx context.Context, email string) (*AuthUser, error) {
	var u AuthUser
	err := r.db.Pool.QueryRow(ctx,
		`SELECT id, username, email, password_hash, COALESCE(is_organizer, false) FROM users WHERE email = $1 OR username = $1 LIMIT 1`,
		email,
	).Scan(&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.IsOrganizer)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, pgx.ErrNoRows
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, input CreateUserInput) (*AuthUser, error) {
	var u AuthUser
	err := r.db.Pool.QueryRow(ctx, `
		INSERT INTO users (username, email, password_hash, first_name, last_name, is_organizer, is_eco_conscious)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, username, email, password_hash, COALESCE(is_organizer, false)
	`,
		input.Username,
		input.Email,
		input.PasswordHash,
		input.FirstName,
		input.LastName,
		input.IsOrganizer,
		input.IsEcoConscious,
	).Scan(&u.ID, &u.Username, &u.Email, &u.PasswordHash, &u.IsOrganizer)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetProfileByID(ctx context.Context, userID uuid.UUID) (*UserProfile, error) {
	var p UserProfile
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, username, email, first_name, last_name, phone, bio, profile_image_url,
		       COALESCE(is_organizer, false), COALESCE(is_eco_conscious, false)
		FROM users
		WHERE id = $1
	`,
		userID,
	).Scan(
		&p.ID,
		&p.Username,
		&p.Email,
		&p.FirstName,
		&p.LastName,
		&p.Phone,
		&p.Bio,
		&p.ProfileImageURL,
		&p.IsOrganizer,
		&p.IsEcoConscious,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *UserRepository) UpdateProfileByID(ctx context.Context, userID uuid.UUID, input UpdateUserProfileInput) (*UserProfile, error) {
	var p UserProfile
	err := r.db.Pool.QueryRow(ctx, `
		UPDATE users
		SET first_name = $2,
		    last_name = $3,
		    phone = $4,
		    bio = $5,
		    profile_image_url = $6,
		    is_eco_conscious = $7
		WHERE id = $1
		RETURNING id, username, email, first_name, last_name, phone, bio, profile_image_url,
		          COALESCE(is_organizer, false), COALESCE(is_eco_conscious, false)
	`,
		userID,
		input.FirstName,
		input.LastName,
		input.Phone,
		input.Bio,
		input.ProfileImageURL,
		input.IsEcoConscious,
	).Scan(
		&p.ID,
		&p.Username,
		&p.Email,
		&p.FirstName,
		&p.LastName,
		&p.Phone,
		&p.Bio,
		&p.ProfileImageURL,
		&p.IsOrganizer,
		&p.IsEcoConscious,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}
