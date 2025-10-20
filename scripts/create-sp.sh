#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/create-sp.sh <RESOURCE_GROUP>
# This script creates an Azure service principal scoped to the given resource group
# and writes the SDK-auth JSON to sp-auth.json in the current directory.

SUBSCRIPTION_ID="97d9a3d7-5693-4992-a879-c819818f4e97"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <RESOURCE_GROUP>" >&2
  exit 2
fi

RESOURCE_GROUP="$1"

echo "Creating service principal scoped to subscription $SUBSCRIPTION_ID, resource group $RESOURCE_GROUP"

az login --only-show-errors
az account set --subscription "$SUBSCRIPTION_ID"

az ad sp create-for-rbac \
  --name "github-deploy-sp-odins" \
  --role contributor \
  --scopes /subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP} \
  --sdk-auth > sp-auth.json

echo "Wrote sp-auth.json. Paste its contents into the AZURE_CREDENTIALS GitHub secret."
echo "Don't commit sp-auth.json to source control."
