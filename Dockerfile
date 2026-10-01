FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY server.js ./
COPY src ./src
COPY public ./public
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "server.js"]
