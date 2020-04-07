import AbstractController from '@/app/declares/AbstractController'
import ResponseResult from '@/app/services/ResponseResult'
import logger from '@/app/utils/logger'
import Bluebird from 'bluebird'
import { RequestHandler } from 'express'
import ExpressPromiseRouter from 'express-promise-router'
import {
  NextFunction,
  PathParams,
  Request,
  Response,
  Router,
} from 'express-serve-static-core'
import { checkSchema } from 'express-validator'
import fs from 'fs'
import passport from 'passport'
import path from 'path'

interface IRoute {
  name: string
  controller: AbstractController<any>
}

class Routes {
  public router: Router
  private routes: IRoute[] = []
  private routeList: any[] = []

  constructor() {
    this.router = ExpressPromiseRouter()
    this.importControllers = this.importControllers.bind(this)
  }

  public async importControllers() {
    logger.debug('Loading controllers')
    const controllerDirectory = path.resolve(__dirname, 'app/controllers')
    let controllerFiles = fs.readdirSync(controllerDirectory) || []
    controllerFiles = controllerFiles.filter(
      (fileName) => !/\.d\.ts$/.test(fileName) && /\.(ts|js)$/.test(fileName),
    )
    logger.debug(`List controllers: ${controllerFiles.join(', ')}`)
    await Bluebird.map(controllerFiles, async (fileName) => {
      const {
        default: controller,
      }: {
        default: AbstractController<any>
      } = await import(path.join(controllerDirectory, fileName))
      const className = String(controller.constructor.name)

      if (!controller) {
        throw new Error(`${fileName} isn't had controller`)
      }
      const matchTag = className.match(/^(\w+)Controller$/)
      if (!matchTag || matchTag.length === 0) {
        throw new Error(`Can't detect controller name`)
      }
      let [, name] = matchTag
      if (controller.name) {
        name = controller.name
      }

      if (name.length === 0) {
        throw new Error(`Controller name is invalid. (${fileName})`)
      }
      controller.setName(name.toLowerCase())
      this.routes.push({ name: controller.name, controller })
      logger.debug(`Loaded ${className} success`)
    }).then(() => logger.debug('Loaded the controllers successfully'))
    return this
  }

  /**
   * registerRouter
   */
  public registerRouter() {
    this.router.get('/route-list', this.getRouteList.bind(this))
    this.routes.forEach(
      ({
        name: routeName,
        controller: {
          methods = [],
          checkValidArguments,
          setControllerName,
          checkPermission,
        },
      }) => {
        methods.forEach((method) => {
          const {
            authorized = true,
            ignoreExpiration,
            validationSchema,
            isRoot,
            type,
            _ref,
            path: methodPath,
            middleware,
          } = method
          if (!type || !_ref) return
          const registerRoutes = {
            GET: (pathParams: PathParams, ...handlers: RequestHandler[]) =>
              this.router.get(pathParams, ...handlers),
            POST: (pathParams: PathParams, ...handlers: RequestHandler[]) =>
              this.router.post(pathParams, ...handlers),
            PUT: (pathParams: PathParams, ...handlers: RequestHandler[]) =>
              this.router.put(pathParams, ...handlers),
            DELETE: (pathParams: PathParams, ...handlers: RequestHandler[]) =>
              this.router.delete(pathParams, ...handlers),
          }
          const registerRoute = registerRoutes[type]
          const args: RequestHandler[] = [setControllerName]
          if (authorized)
            args.push(this.handleInvalidToken.bind(this, ignoreExpiration))
          args.push(checkPermission.bind(null, method))
          if (validationSchema)
            args.push(...checkSchema(validationSchema), checkValidArguments)
          if (Array.isArray(middleware)) args.push(...middleware)
          args.push(_ref)
          const routeStrArr = ['', routeName, methodPath]
          if (isRoot) routeStrArr.splice(1, 1)
          const pRoute = routeStrArr
            .filter((tPath) => typeof tPath === 'string')
            .join('/')
          this.routeList.push({
            path: pRoute,
            method: type,
            ignoreExpiration,
            authorized,
            isRoot,
            validationSchema,
          })
          // register route
          registerRoute(pRoute, ...args)
        })
      },
    )
    return this
  }

  private getRouteList({ query: { route } }: Request, res: Response) {
    let list = this.routeList
    if (route) {
      list = list.filter((r) => r.path === `/${route}`)
    }
    list = [
      ...list,
      { path: '/route-list', query: [{ name: 'route', type: 'string' }] },
    ]
    res.send(
      new ResponseResult({
        message: 'Get route list',
        data: list,
      }),
    )
  }

  private handleInvalidToken(
    ignoreExpiration: boolean,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    return passport.authenticate(
      ignoreExpiration ? 'jwt-ignoreExpiration' : 'jwt',
      {
        session: false,
      },
      (error, user, info) => {
        if ((info && error) || !user) {
          let message = 'User not found'
          if (error && error.message) {
            message = error.message
          }
          if (info && info.message) {
            message = info.message
          }
          res.statusCode = 401
          return res.send({ status: 401, message })
        }
        req.user = user
        return next()
      },
    )(req, res)
  }
}

const routesInstance = new Routes()
export default routesInstance
