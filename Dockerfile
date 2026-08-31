FROM node:22.22.2-bookworm-slim

WORKDIR /app

ENV VITE_APP_ENV=local
ENV VITE_API_MODE=real
ENV VITE_API_BASE_URL=http://host.docker.internal:8080

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
