# Blueship Typescript Node Starter

## I. Deploy & Run

> Deploy app on developer mode.

### 1. Prerequisites

- Yarn
- NodeJs
- MongoDB

You shouldn't execute yarn command or any command relate to nodejs on sudo mode. Only install nodejs on standard user.

### 2. Install

> yarn install

### 3. Build

> yarn build

### 4. Setup environments variable

Copy example environment file to new file with the name .env

> cp .env.example .env

Then edit variables accordingly on .env file.

Noitice: Only if you want to check your system on production mode, you will remove # at before NODE_ENV. And you should read and understand comments in this file.

### 5. Run

- Standard mode

> yarn start

- Debug mode

When you are editing and saving any file, the system will auto compile and restart server.

> yarn watch-debug

## II. References

- [NodeJS](https://nodejs.org/en/)
- [Yarn Install](https://yarnpkg.com/lang/en/docs/install)
- [Typescript Node Starter](https://github.com/Microsoft/TypeScript-Node-Starter)
- [MongoDB](https://www.mongodb.com/)
