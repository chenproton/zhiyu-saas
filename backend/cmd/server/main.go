package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/zhiyu-saas/backend/internal/config"
	"github.com/zhiyu-saas/backend/internal/db"
	"github.com/zhiyu-saas/backend/internal/router"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	database, err := db.New(cfg.DatabaseURL)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer database.Close()

	r := router.New(database.Pool, cfg.JWTSecret)

	addr := fmt.Sprintf(":%s", cfg.Port)
	slog.Info("starting server", "addr", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		slog.Error("server error", "error", err)
		os.Exit(1)
	}
}
