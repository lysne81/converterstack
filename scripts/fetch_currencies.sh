#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error -G \
  https://api.currencyapi.com/v3/currencies \
  -H "apikey: ${CURRENCY_API_KEY:?CURRENCY_API_KEY is required}" \
  -H "Content-Type: application/json" \
  > public/currencies.json
