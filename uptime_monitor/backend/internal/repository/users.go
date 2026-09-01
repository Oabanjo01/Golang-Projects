package repository

import (
	"context"
	"errors"
	"fmt"
	"uptime_monitor/internal/models"
	"uptime_monitor/internal/service"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Make sure my actual repository still satisfies the interface.
var _ service.UserRepository = (*UserRepository)(nil)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(ctx context.Context, email string, passwordHash string) (*models.RegisterResponse, error) {
	query := `
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, email, created_at, updated_at
	`

	var u models.RegisterResponse
	err := r.db.QueryRow(ctx, query, email, passwordHash).Scan(
		&u.ID,
		&u.Email,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		// SQLSTATE 23505 is PostgreSQL's unique_violation error
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, service.ErrDuplicateEmail
		}
		return nil, fmt.Errorf("create user error: %w", err)
	}

	return &u, nil
}
