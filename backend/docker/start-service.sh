#!/bin/sh

set -eu

service_mode="${SERVICE_MODE:-api}"

if [ "$service_mode" = "api" ]; then
  echo "Running Prisma migrations..."
  pnpm prisma migrate deploy

  echo "Running Prisma seed..."
  pnpm prisma:seed

  exec pnpm start:dev
fi

if [ "$service_mode" = "worker" ]; then
  exec pnpm start:worker
fi

echo "Unknown SERVICE_MODE: $service_mode" >&2
exit 1
