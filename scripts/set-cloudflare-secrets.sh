#!/usr/bin/env bash
set -euo pipefail

repo="Bywron1/lighthouse"

read -rsp "Cloudflare API token: " token; echo
read -rp "Cloudflare account ID: " account_id

printf '%s' "$token" | gh secret set CLOUDFLARE_API_TOKEN --repo "$repo"
printf '%s' "$account_id" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$repo"

unset token account_id
gh secret list --repo "$repo"
