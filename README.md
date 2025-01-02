# ft_transcendence

## Project Overview

ft_transcendence is a comprehensive full-stack web application developed as part of the 42 Network curriculum. The project is designed to simulate a real-world software development process, focusing on the integration of various technologies including Docker, backend services, and frontend frameworks.

The objective of this project is to create a functional and scalable application that demonstrates proficiency in both backend and frontend development, along with the deployment and management of services using Docker.

## Project Structure

The project is structured as follows:

- **backend/**: Contains all backend-related files and directories.
- **docker/**: Includes Docker configuration files for setting up the project environment.
  - `backend.dockerfile`: Dockerfile for the backend service.
  - `frontend.dockerfile`: Dockerfile for the frontend service.
  - `backend.env`: Environment variables for the backend service.
  - `frontend.env`: Environment variables for the frontend service.
  - `postgres.env`: Environment variables for the PostgreSQL database.
- **frontend/**: Contains all frontend-related files and directories.
- **srcs/**: Contains source code and scripts.
  - `clean.sh`: Script to clean up the environment.
  - `docker-compose.yml`: Docker Compose file for orchestrating multi-container Docker applications.
  - `README.md`: The documentation file you are reading.
  - `start.sh`: Script to start the application.

## Contributors

This project is created and maintained by the following contributors:

- **hamzak99** - Full-stack Developer
- **Amine (madebyamine)** - Backend Developer
- **Ramzy842** - Frontend Developer
- **Ahmed Yakoubi (YKO-01)** - DevOps Engineer

## Getting Started

To get started with ft_transcendence, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/YKO-01/ft_transcendence42.git
2. Add .env file:
   ```bash
   # Password for the 'elastic' user (at least 6 characters)
    ELASTIC_USER=elastic
    ELASTIC_PASSWORD=changeme
    
    # Password for the 'kibana_system' user (at least 6 characters)
    KIBANA_USER=kibana_system
    KIBANA_PASSWORD=changeme
    
    # Version of Elastic products
    STACK_VERSION=8.15.0
    
    # Set the cluster name
    CLUSTER_NAME=docker-cluster
    
    # Set to 'basic' or 'trial' to automatically start the 30-day trial
    LICENSE=basic
    
    # Port to expose Elasticsearch HTTP API to the host
    ES_PORT=9200
    
    # Port to expose Kibana to the host
    KIBANA_PORT=5601
    
    ENCRYPTION_KEY=1357305781462384798cb09d46020978
    
    # Increase or decrease based on the available host memory (in bytes)
    ES_MEM_LIMIT=1073741824
    KB_MEM_LIMIT=1073741824
    LS_MEM_LIMIT=1073741824

