# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Override at build time if needed, e.g. --build-arg REACT_APP_API_URL=http://host.docker.internal:5050
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Required for react-scripts 3.x with Node 17+ (OpenSSL 3.0)
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default config and use our SPA config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
