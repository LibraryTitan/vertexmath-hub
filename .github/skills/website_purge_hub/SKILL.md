---
name: website_purge_hub
description: >
  Purges the Cloudflare cache for vertexmath.org only.
  Does NOT redeploy — just clears the CDN cache so the next request
  fetches fresh content from GitHub Pages origin.
  Use when the site feels stale but you don't need a full redeploy.
---

# website_purge_hub — Purge VertexMath Hub Cloudflare Cache

## Overview

Purges Cloudflare's cached content for `vertexmath.org` using hostname-targeted purge. This is a cache-only operation — it does NOT rebuild or redeploy the site.

## When to Use

- User invokes `/website_purge_hub`
- Cache seems stale but no code changes need deploying
- After manual Cloudflare rule changes to force immediate effect
- Debugging cache behavior

## When NOT to Use

- If you need to deploy new code — use the deploy workflow instead (which triggers GitHub Actions, which automatically purges cache after deploy)

## Execution Steps

### Step 1 — Load credentials

1. `cd` to the paper-builder workspace root (`C:\Users\LibraryTitan\mathpaper-builder`) — this is where the `.env` with Cloudflare creds lives
2. Read `.env` file and extract `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID`
3. If `.env` is missing or doesn't have the values, ask the user for them

### Step 2 — Purge cache

Run in PowerShell:
```powershell
$envContent = Get-Content "C:\Users\LibraryTitan\mathpaper-builder\.env" | ForEach-Object {
    if ($_ -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$') {
        @{ $Matches[1] = $Matches[2].Trim() }
    }
}
$token = ($envContent | Where-Object { $_.Keys -contains 'CLOUDFLARE_API_TOKEN' })['CLOUDFLARE_API_TOKEN']
$zoneId = ($envContent | Where-Object { $_.Keys -contains 'CLOUDFLARE_ZONE_ID' })['CLOUDFLARE_ZONE_ID']

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}
$body = '{"hosts":["vertexmath.org"]}'

$result = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/purge_cache" -Method POST -Headers $headers -Body $body
$result | ConvertTo-Json -Depth 5
```

### Step 3 — Verify

1. Check that `$result.success` is `True`
2. Report to the user: "Cloudflare cache purged for vertexmath.org"
3. Suggest they open the site and check DevTools Network tab for `CF-Cache-Status: MISS` on the first load

### Notes

- This purges only `vertexmath.org` — not the entire zone (builder.vertexmath.org and online.vertexmath.org are unaffected)
- The GitHub Actions deploy workflow (`deploy.yml`) already purges cache automatically after every deploy, so this skill is only needed for manual/emergency purges
- All VertexMath sites share the same Cloudflare zone (vertexmath.org), same API token, same Zone ID
- The `.env` file with Cloudflare credentials lives in the mathpaper-builder project
