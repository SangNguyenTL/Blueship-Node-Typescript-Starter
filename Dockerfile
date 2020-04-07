# The instructions for the first stage
FROM circleci/node as Builder

# Create app directory
USER root

COPY package*.json ./

RUN yarn

# The instructions for second stage
FROM circleci/node

WORKDIR /usr/src/app

USER root

COPY --from=builder node_modules node_modules

COPY . .

RUN yarn build:prod

EXPOSE 80 9229
CMD ["node", "dist/server.js"]