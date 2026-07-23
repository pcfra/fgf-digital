#!/bin/bash
# Deploy script para Doyo Olimpo
# Uso: ./deploy.sh [railway|render|docker]

set -e

PROJECT_DIR="/home/lordfra/Documents/FGF Digital/projects/clientes/doyo-olimpo"
cd "$PROJECT_DIR"

case "$1" in
  railway)
    echo "🚂 Deployando a Railway..."
    if ! command -v railway &> /dev/null; then
      echo "Instalando Railway CLI..."
      npm install -g @railway/cli
    fi
    railway login
    railway init
    railway up
    ;;
  render)
    echo "🎨 Deployando a Render..."
    echo "1. Ve a https://dashboard.render.com"
    echo "2. New > Blueprint > Conecta tu repo GitHub"
    echo "3. Render detectará render.yaml automáticamente"
    echo "4. Agrega variable WHATSAPP_OWNER=+56993550082 en Environment"
    ;;
  docker)
    echo "🐳 Construyendo imagen Docker..."
    docker build -t doyo-olimpo .
    echo "✅ Imagen construida. Para correr:"
    echo "   docker run -d -p 3333:3333 -e WHATSAPP_OWNER=+56993550082 doyo-olimpo"
    ;;
  *)
    echo "Uso: ./deploy.sh [railway|render|docker]"
    echo ""
    echo "  railway  - Deploy a Railway (gratis 500h/mes)"
    echo "  render   - Instrucciones para Render (gratis con sleep)"
    echo "  docker   - Construye imagen Docker local"
    ;;
esac