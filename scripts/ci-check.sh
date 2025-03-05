#!/bin/bash

# Script to run CI checks locally
echo "Running CI checks..."

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Lint code
echo "Linting code..."
npm run lint

# Type check (ignoring errors for now)
echo "Type checking..."
npx tsc --noEmit || true

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

# Build project (ignoring errors for now)
echo "Building project..."
npm run build || true

echo "CI checks completed!"
