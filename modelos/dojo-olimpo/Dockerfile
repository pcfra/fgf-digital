# Node.js 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Copiar package.json y lock
COPY package*.json ./

# Instalar deps (solo producción)
RUN npm ci --only=production

# Copiar todo el proyecto
COPY . .

# Puerto
EXPOSE 3333

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3333

# Comando de inicio
CMD ["node", "server.js"]