FROM node:16-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run docker:build

FROM node:16-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN chown node:node .
USER node
COPY --chown=node:node package*.json ./
RUN npm ci
# App files
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
# Migration files
COPY --chown=node:node ./migrations ./migrations
COPY --chown=node:node ./db-migrate.json ./db-migrate.json
# Scripts
COPY --chown=node:node ./scripts ./scripts
# Public folder
COPY --chown=node:node ./public ./public
EXPOSE 3000
CMD ["npm", "run", "docker"]