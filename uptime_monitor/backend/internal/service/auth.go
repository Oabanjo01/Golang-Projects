package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"uptime_monitor/internal/models"

	"golang.org/x/crypto/bcrypt"
)

var ErrDuplicateEmail = errors.New("email already exists")

type UserRepository interface {
	CreateUser(ctx context.Context, email string, passwordHash string) (*models.RegisterResponse, error)
}

type AuthService struct {
	users UserRepository
}

func NewAuthService(users UserRepository) *AuthService {
	return &AuthService{users: users}
}

func (s *AuthService) Register(ctx context.Context, email, password string) (*models.RegisterResponse, error) {
	email = strings.ToLower(email)

	if len(password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	passwordHashBytes, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	passwordHash := string(passwordHashBytes)

	user, err := s.users.CreateUser(ctx, email, passwordHash)

	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return user, nil
}

func (s *AuthService) LogUserin() {

}
