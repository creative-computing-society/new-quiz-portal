# --- Build Stage ---
FROM golang:1.24.5-alpine AS builder

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
COPY .env .env
COPY admin_portal/static admin_portal/static

ENV PATH="/usr/local/bin:$PATH"

# Copy .env 

EXPOSE 2117

CMD ["./quiz-backend"]