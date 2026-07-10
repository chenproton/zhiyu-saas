package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func parseInt(s string, defaultVal int) (int, error) {
	if s == "" {
		return defaultVal, nil
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal, err
	}
	return v, nil
}

func itoa(i int) string {
	return strconv.Itoa(i)
}

func parseFloat(s string, defaultVal float64) (float64, error) {
	if s == "" {
		return defaultVal, nil
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return defaultVal, err
	}
	return v, nil
}
