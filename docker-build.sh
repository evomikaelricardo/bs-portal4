#!/bin/bash

# Docker build and run script for Interview Evaluation System

set -e

echo "🚀 Interview Evaluation System - Docker Build"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

IMAGE_NAME="interview-evaluation-system"
CONTAINER_NAME="interview-eval-app"
PORT=5000

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Function to show usage
usage() {
    echo "Usage: $0 [build|run|stop|restart|logs|clean]"
    echo ""
    echo "Commands:"
    echo "  build    - Build Docker image"
    echo "  run      - Run container"
    echo "  stop     - Stop container"
    echo "  restart  - Restart container"
    echo "  logs     - Show container logs"
    echo "  clean    - Remove container and image"
    exit 1
}

# Build Docker image
build_image() {
    echo -e "${YELLOW}📦 Building Docker image...${NC}"
    docker build -t $IMAGE_NAME .
    echo -e "${GREEN}✅ Build complete!${NC}"
}

# Run container
run_container() {
    echo -e "${YELLOW}🏃 Starting container...${NC}"
    
    # Stop existing container if running
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo -e "${YELLOW}⚠️  Stopping existing container...${NC}"
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi
    
    # Remove stopped container if exists
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        docker rm $CONTAINER_NAME
    fi
    
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:5000 \
        --restart unless-stopped \
        $IMAGE_NAME
    
    echo -e "${GREEN}✅ Container started!${NC}"
    echo -e "${GREEN}🌐 Application available at: http://localhost:$PORT${NC}"
}

# Stop container
stop_container() {
    echo -e "${YELLOW}🛑 Stopping container...${NC}"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    echo -e "${GREEN}✅ Container stopped!${NC}"
}

# Show logs
show_logs() {
    echo -e "${YELLOW}📋 Showing container logs (Ctrl+C to exit)...${NC}"
    docker logs -f $CONTAINER_NAME
}

# Clean up
clean_all() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Stop and remove container
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        docker stop $CONTAINER_NAME
    fi
    
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
        docker rm $CONTAINER_NAME
    fi
    
    # Remove image
    if [ "$(docker images -q $IMAGE_NAME)" ]; then
        docker rmi $IMAGE_NAME
    fi
    
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
}

# Main script
case "${1:-}" in
    build)
        build_image
        ;;
    run)
        run_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        run_container
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_all
        ;;
    *)
        usage
        ;;
esac
