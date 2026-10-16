# Estágio de desenvolvimento
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Estágio de build para produção
FROM development AS builder

ARG VITE_API_URL
ARG VITE_GEMINI_KEY
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GEMINI_KEY=$VITE_GEMINI_KEY
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# Estágio final de produção com Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
