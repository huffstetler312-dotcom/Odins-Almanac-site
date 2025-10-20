#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/create-sp.sh <RESOURCE_GROUP>
#   ./scripts/create-sp.sh <SUBSCRIPTION_ID> <RESOURCE_GROUP>
# Or set environment variable AZ_SUBSCRIPTION_ID and run:
#   AZ_SUBSCRIPTION_ID=... ./scripts/create-sp.sh <RESOURCE_GROUP>
#
# This script creates an Azure service principal scoped to the given resource group
# and writes the SDK-auth JSON to sp-auth.json in the current directory.

# Embedded fallback subscription ID (will be used only if no env/arg provided)
DEFAULT_SUBSCRIPTION_ID="97d9a3d7-5693-4992-a879-c819818f4e97"

# Resolve subscription ID and resource group from args/env
if [ "$#" -eq 2 ]; then
  SUBSCRIPTION_ID="$1"
  RESOURCE_GROUP="$2"
elif [ "$#" -eq 1 ]; then
  SUBSCRIPTION_ID="${AZ_SUBSCRIPTION_ID:-$DEFAULT_SUBSCRIPTION_ID}"
  RESOURCE_GROUP="$1"
else
  echo "Usage: $0 <RESOURCE_GROUP>" >&2
  echo "       $0 <SUBSCRIPTION_ID> <RESOURCE_GROUP>" >&2
  echo "Or set AZ_SUBSCRIPTION_ID env var and run: AZ_SUBSCRIPTION_ID=... $0 <RESOURCE_GROUP>" >&2
  exit 2
fi

if [ -z "${SUBSCRIPTION_ID}" ]; then
  echo "Subscription ID is empty. Provide it as first arg or via AZ_SUBSCRIPTION_ID env var." >&2
  exit 2
fi

if [ -z "${RESOURCE_GROUP}" ]; then
  echo "Resource group is empty. Provide the resource group name as an argument." >&2
  exit 2
fi

echo "Creating service principal scoped to subscription ${SUBSCRIPTION_ID}, resource group '${RESOURCE_GROUP}'"

# Ensure az is available
if ! command -v az >/dev/null 2>&1; then
  echo "Azure CLI (az) is not installed or not in PATH." >&2
  exit 3
fi

echo "Logging into Azure (interactive if required)..."
az login --only-show-errors
az account set --subscription "${SUBSCRIPTION_ID}"

OUTFILE="sp-auth.json"
az ad sp create-for-rbac \
  --name "github-deploy-sp-odins" \
  --role contributor \
  --scopes /subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP} \
  --sdk-auth > "${OUTFILE}"

echo "Wrote ${OUTFILE}. Paste its contents into the AZURE_CREDENTIALS GitHub secret." 
echo "IMPORTANT: Do NOT commit ${OUTFILE} to source control. Remove it when done: rm -f ${OUTFILE}"
