#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/sitio-agencia/_screenshots"
BASE="http://127.0.0.1:8765"
CHROME="${CHROME:-chromium}"

mkdir -p "$OUT"

shot() {
  local name="$1"
  local url="$2"
  local w="${3:-1280}"
  local h="${4:-800}"
  echo "→ $name"
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size="$w,$h" \
    --screenshot="$OUT/$name" \
    "$url" 2>/dev/null
}

shot "dojo.png" "$BASE/modelos/dojo-olimpo/index.html"
shot "barberia.png" "$BASE/modelos/barberia-oldschool.html"
shot "taller.png" "$BASE/modelos/taller-automotriz.html"
shot "restaurant.png" "$BASE/modelos/restaurant-don-carlo.html"
shot "admin-desarmaduria.png" "$BASE/proyecto-desarmaduria/admin/index.html"
shot "app-movil-desarmaduria.png" "$BASE/proyecto-desarmaduria/app-movil/index.html" 390 844

echo "Listo: $OUT"
