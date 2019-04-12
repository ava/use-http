#!/bin/bash

# Copy Hashed main.[hash].chunk.js file to static build/main.js
MAIN_BUILD_DIRECTORY="./build"

log() {
  echo "POSTBUILD: $1"
}

if [ ! -d "$MAIN_BUILD_DIRECTORY" ]; then
  log "No build directory existed, please build before running postbuild..."
fi

COMPILED_MAIN_FILE=$(find ./build/static -name 'main.*.chunk.js')

if [ -z "$COMPILED_MAIN_FILE" ]; then
  log "Could not find compiled main.js file..."
else
  log "Found compiled main.js file, copying..."
  cp "$COMPILED_MAIN_FILE" "./build/main.js"
  log "Created build/main.js file successfully."
fi
