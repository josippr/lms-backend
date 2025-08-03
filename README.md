
# LMS Backend

Backend API for a modern network monitoring and device management platform. Built with Node.js, Express, and MongoDB (Mongoose & native drivers). Provides authentication, device registration, metrics logging, real-time updates, and comprehensive data management.


## Features

- **User Authentication**: Register, log in, and verify users with JWT-based authentication.
- **Device Management**: Register, list, update trust level, and manage devices.
- **Metrics Logging**: Collect and retrieve device usage and network metrics.
- **Data Aggregation**: Fetch dashboard data from all MongoDB collections.
- **Network Reporting**: Accept device network reports (client certificate verification supported).
- **WebSocket Support**: Real-time updates via Socket.IO for dashboards and widgets.
- **Role-based Access**: User roles and permissions for API access.
- **Rate Limiting**: Protect endpoints from abuse.
- **Environment-based Configuration**: Easily configurable via [`.env`](.env) file.
- **Docker & CI/CD**: Ready for containerized deployment and Drone CI/CD.


## Project Structure

```
.
├── api/                # API route handlers
│   ├── auth/           # User authentication (register, login, verify)
│   ├── data/           # Dashboard data aggregation
│   ├── devices/        # Device management (list, update trust)
│   ├── logs/           # Usage metrics logging
│   ├── metrics/        # Device metrics retrieval
│   ├── network/        # Network & intrusion reporting
│   ├── networkStatus/  # Network status widgets
│   └── register-device/# Device registration
├── middleware/         # Express middleware (JWT verification, etc.)
├── models/             # Mongoose models (User, Device, DeviceMetadata, etc.)
├── services/           # Business logic, dashboard widgets
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
   - Copy [`.env`](.env) and update values as needed (MongoDB URI, JWT secret, etc.)
4. **Start the server:**
   ```sh
   node index.js
   ```
   The server will start on the port specified in `.env` (default: 1304).

### Docker

To run the backend in Docker:

```sh
docker-compose up --build
```


## API Endpoints (Summary)

### Authentication
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Log in and receive a JWT
- `POST /api/users/verify-token` — Verify JWT token

### Devices
- `GET /api/devices` — List all devices (JWT required)
- `PUT /api/devices/update/:mac` — Update device trust level (JWT required)

### Device Registration
- `POST /api/register-device` — Register a device (JWT required)

### Metrics
- `POST /api/logs/usage-metrics` — Log device usage metrics (client certificate required)
- `GET /api/metrics/:uid` — Get latest metrics for a device (JWT required)

### Data
- `GET /api/data` — Fetch dashboard data (JWT required)

### Network
- `POST /api/network/report` — Report device network info (client certificate required)

### WebSocket
- Real-time updates for dashboards and widgets via Socket.IO (`/api/json`)

### More
- See source for additional endpoints: alerts, profiles, network status, intrusion detection, etc.


## Testing

Test scripts are provided for device registration and other flows:

```sh
node scripts/test-register-device.js
```


## Environment Variables

See [`.env`](.env) for all configuration options. Key variables:

- `PORT` — Server port
- `JWT_SECRET` — Secret for JWT signing
- `MONGO_URI`, `MONGO_URI_ORIGINAL`, `MONGO_DB_NAME`, `AUTH_SOURCE` — MongoDB connection


## Deployment

- **Local:**
  - `npm install && node index.js`
- **Docker:**
  - `docker-compose up --build`
- **CI/CD:**
  - Includes a [`.drone.yml`](.drone.yml) for Drone CI/CD
  - [`Dockerfile`](Dockerfile) for container builds

## License

ISC License

---

For more details, see the source code and comments in each file. Contributions welcome!