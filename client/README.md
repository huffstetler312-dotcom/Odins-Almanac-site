# Odin's Almanac Frontend

React-based frontend application for Odin's Almanac.

## Building with Docker

### Build the image

```bash
docker build -t odins-almanac-client .
```

### Run the container

```bash
docker run -p 80:80 odins-almanac-client
```

The application will be available at http://localhost

## Building from root directory

If you need to build from the repository root:

```bash
docker build -f client/Dockerfile -t odins-almanac-client ./client
```

## Local Development

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm start
```

The application will open at http://localhost:3000

### Build for production

```bash
npm run build
```

The production build will be in the `build/` directory.

## Features

- Multi-stage Docker build for optimized image size
- Nginx web server with production-ready configuration
- React Router support
- Security headers
- Static asset caching
- Health check endpoint
