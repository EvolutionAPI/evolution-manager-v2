#!/bin/bash
set -e

VERSION=${1:?Usage: $0 <version>}
IMAGE="evolutionfoundation/evolution-manager-v2"

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag "${IMAGE}:${VERSION}" \
  --tag "${IMAGE}:latest" \
  --push \
  .
