# LMS Backend

This repository contains the backend API for the Network monitor platform. It is built with Node.js, Express, and MongoDB (using both Mongoose and native drivers). The backend provides authentication, device registration, metrics logging, and data management endpoints.

## Features

- **User Authentication**: Register and log in users with JWT-based authentication.
- **Device Management**: Register, list, and manage devices.
- **Metrics Logging**: Collect and retrieve device usage metrics.
- **Data Aggregation**: Fetch all data from MongoDB collections.
- **Network Reporting**: Accept device network reports with client certificate verification.
- **Rate Limiting**: Protect endpoints from abuse.
- **Environment-based Configuration**: Easily configurable via [`.env`](.env ) file.

## Project Structure

```
.
├── api/                # API route handlers
│   ├── auth/           # User authentication
│   ├── data/           # Data aggregation
│   ├── devices/        # Device management
│   ├── logs/           # Usage metrics logging
│   ├── metrics/        # Device metrics retrieval
│   ├── network/        # Network reporting
│   └── register-device/# Device registration
├── middleware/         # Express middleware (e.g., JWT verification)
├── models/             # Mongoose models
├── scripts/            # Utility/test scripts
├── .env                # Environment variables
├── Dockerfile          # Docker build instructions
├── docker-compose.yml  # Docker Compose setup
├── index.js            # Application entry point
└── package.json        # NPM dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/lms-backend.git
   cd lms-backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy [`.env`](.env ) and update values as needed (MongoDB URI, JWT secret, etc.)

4. **Start the server:**
   ```sh
   node index.js
   ```
   The server will start on the port specified in [`.env`](.env ) (default: 1304).

### Docker

To run the backend in Docker:

```sh
docker-compose up --build
```

## API Endpoints

### Authentication

- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Log in and receive a JWT

### Devices

- `GET /api/devices` — List all devices (JWT required)

### Device Registration

- `POST /api/register-device` — Register a device (JWT required)

### Metrics

- `POST /api/logs/usage-metrics` — Log device usage metrics (client certificate required)
- `GET /api/metrics/:uid` — Get latest metrics for a device (JWT required)

### Data

- `GET /api/data` — Fetch all data from all collections (JWT required)

### Network

- `POST /api/network/report` — Report device network info (client certificate required)

## Testing

A test script is provided for device registration:

```sh
node scripts/test-register-device.js
```

## Environment Variables

See [`.env`](.env ) for all configuration options:

- [`PORT`](/home/josip/.cache/typescript/5.8/node_modules/@types/node/globals.d.ts ) — Server port
- [`JWT_SECRET`](api/auth/auth.js ) — Secret for JWT signing
- [`MONGO_URI`](index.js ), [`MONGO_URI_ORIGINAL`](/home/josip/.cache/typescript/5.8/node_modules/@types/node/globals.d.ts ), [`MONGO_DB_NAME`](/home/josip/.cache/typescript/5.8/node_modules/@types/node/globals.d.ts ), [`AUTH_SOURCE`](api/metrics/metrics.js ) — MongoDB connection

## Deployment

This project includes a [`.drone.yml`](.drone.yml ) for CI/CD with Drone and a [`Dockerfile`](Dockerfile ) for container builds.

## License

ISC License

---

For more details, see the source code and comments in each file.