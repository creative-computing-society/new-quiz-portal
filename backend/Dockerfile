# --- Build Stage ---
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o quiz-backend main.go

# --- Run Stage ---
FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/quiz-backend .
COPY admin_portal/templates ./admin_portal/templates

# Copy .env if you want, or mount it as a secret/volume in production
# COPY .env .env

EXPOSE 2117

CMD ["./quiz-backend"]