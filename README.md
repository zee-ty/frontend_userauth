## How to run

### Prerequisites

- Node.js (v16 or v18 recommended)
- The auth backend running with CORS enabled for your frontend origin

Start the front end using Docker below:

### Docker

1. Build and run:
   ```bash
   docker compose up --build
   ```

2. Open [http://localhost:3000](http://localhost:3000). The app is served on port 3000, backend runs separately.

### Running tests with Docker

Tests use a separate image `Dockerfile.test` and the `test` service in `docker-compose.yml`.

**Build the test image only, then run:**

```bash
docker build -f Dockerfile.test -t frontend-userauth-test .
docker run --rm frontend-userauth-test
```

Tests run in CI mode: single run, no watch, with coverage. The process exits with a non-zero code if any test fails.
