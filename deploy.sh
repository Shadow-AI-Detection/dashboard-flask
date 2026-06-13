#!/bin/bash
set -e

source .env.deploy

echo "Running tests..."
python3 -m pytest tests/ -v

echo "Building Docker image..."
docker build --platform linux/amd64 -t $IMAGE_NAME .
docker tag $IMAGE_NAME:$IMAGE_TAG $FULL_IMAGE_NAME

echo "Pushing image to ACR..."
docker push $FULL_IMAGE_NAME

echo "Deploying to Azure Container App..."
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $FULL_IMAGE_NAME \
  --revision-suffix "v$(date +%s)"

echo "Deployment complete!"