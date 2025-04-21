# Use the official Playwright Docker image for Ubuntu 22.04 (Jammy)
FROM mcr.microsoft.com/playwright:v1.45.0-jammy

# Set the working directory
WORKDIR /app

# Install pip and AWS CLI
RUN apt-get update && \
    apt-get install -y python3-pip jq && \
    pip3 install awscli && \
    apt-get clean

## Copy the package.json and package-lock.json files
#COPY package.json package-lock.json ./
#
## Install dependencies
#RUN npm install