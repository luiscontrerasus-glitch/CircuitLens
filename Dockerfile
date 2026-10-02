FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY server.js ./
COPY src ./src
COPY public ./public
COPY scripts/build.js ./scripts/build.js
COPY LICENSE ./
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production VISION_USAGE_FILE=/app/.runtime/vision-usage.json
COPY --from=build /app/dist/ ./
RUN npm ci --omit=dev && mkdir -p /app/.runtime && chown node:node /app/.runtime
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
