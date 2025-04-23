FROM node:22-alpine AS builder
ENV NODE_ENV=production

WORKDIR /app

# copy project and source
COPY ./package.json ./tsconfig.json ./
COPY ./src ./src
RUN ls -la

# install dependencies
RUN npm install --include=dev

# build
RUN npm run build

FROM node:22-alpine

WORKDIR /app

# copy node_modules
COPY --from=builder /app/node_modules /app/node_modules

# copy built files
COPY --from=builder /app/dist /app/dist

# run
CMD ["node", "./dist/main.js"]
