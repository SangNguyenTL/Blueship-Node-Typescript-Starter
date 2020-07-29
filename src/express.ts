import config from '@/app/config/index'
const { MONGODB_URI, SESSION_SECRET } = config

import errorHandlers from '@/app/utils/errorHandler'
import importModels from '@/models'
import RouterFactory from '@/router'
import Bluebird from 'bluebird'
import bodyParser from 'body-parser'
import compression from 'compression' // compresses requests
import mongo from 'connect-mongo'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import expressSession from 'express-session'
import helmet from 'helmet'
import mongoose from 'mongoose'
import morgan from 'morgan'
import nocache from 'nocache'
import passport from 'passport'
import path from 'path'

// Passport provider
import '@/app/providers/jwt'
import '@/app/providers/local'
import logger from '@/app/utils/logger'

// Creates and configures an ExpressJS web server.
class App {
  // ref to Express instance
  public express: express.Application
  // DB Connection
  private connection: mongoose.Connection
  // DB store
  private MongoStore: mongo.MongoStoreFactory
  // Run configuration methods on the Express instance.
  constructor() {
    this.express = express()
    // Connect to MongoDB
    this.connectDB = this.connectDB.bind(this)
    this.middleware = this.middleware.bind(this)
  }

  public async init() {
    await this.connectDB()
    await importModels()
    this.middleware()
    await RouterFactory.importControllers()
    RouterFactory.registerRouter()
    return this.routes()
  }

  private async connectDB(): Promise<void> {
    this.MongoStore = mongo(expressSession)
    const mongoUrl = MONGODB_URI
    mongoose.Promise = Bluebird
    logger.debug(`Connecting db at ${mongoUrl}`)
    await mongoose.connect(mongoUrl, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    logger.debug('Connected db successfully')
    this.connection = mongoose.connection
  }

  // Configure Express middleware.
  private middleware(): void {
    // required for passport to initlize it
    this.express.use(passport.initialize())
    // initlize session
    this.express.use(
      expressSession({
        resave: false, // don't save session if unmodified
        saveUninitialized: true,
        secret: SESSION_SECRET,
        store: new this.MongoStore({
          mongooseConnection: this.connection,
        }),
      })
    )
    this.express.use(passport.session())
    this.express.use(
      morgan('dev', {
        stream: {
          write(text: string) {
            logger.info(text)
          },
        },
      })
    )
    this.express.disable('x-powered-by')
    this.express.disable('etag')
    this.express.use(
      helmet({
        frameguard: true,
        xssFilter: true,
        noSniff: true,
      })
    )
    this.express.use(nocache())

    this.express.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
    this.express.use(bodyParser.json()) // parse application/json
    // enable CORS
    this.express.use(cors({ optionsSuccessStatus: 200 }))
    // manage session by cookies
    this.express.use(cookieParser()) // cookie parser
    this.express.set('port', process.env.PORT || 3000)
    // server side template rendering
    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({ extended: false }))
    this.express.use(compression())
    this.express.use(
      '/image',
      express.static(path.join(__dirname, 'public/image'), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
      })
    )
  }

  // Configure API endpoints.
  private routes(): express.Application {
    /* This is just to get up and running, and to make sure what we've got is
     * working so far. This function will change when we start to add more
     * API endpoints */
    this.express.use('/', RouterFactory.router)
    this.express.use(errorHandlers.internalServerError)
    this.express.use(errorHandlers.PageNotFound)
    return this.express
  }
}

export default new App()
