#!/bin/bash

# Script to start Brave in debug mode and run the Next.js dev server

echo "🚀 Starting Brave in debug mode on port 9222..."
# We run Brave in the background. 
# We point it to localhost:3000 immediately; it will refresh when the server is ready.
brave --remote-debugging-port=9222 "http://localhost:3000" &

echo "📦 Starting the project dev server..."
# Run the dev server
npm run dev
