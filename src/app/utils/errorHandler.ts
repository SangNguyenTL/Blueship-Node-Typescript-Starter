import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express-serve-static-core'
import logger from './logger'

interface IResponse<T extends any> {
  status: string
  statusCode: number
  message: string
  data?: T
}

interface IHandledError {
  id: string
  defaultMessage?: string
}

class ErrorHandler {
  public internalServerError(
    error: any,
    req: Request,
    res: Response,
    _: NextFunction,
  ) {
    const { name: errorName } = error
    let { controllerName } = req

    const adapter: {
      [key: string]: (args: any) => IResponse<IHandledError>
    } = {
      ValidationError: (err: {
        name: string
        message: string
        errors?: any
        statusCode?: number
      }) => {
        let { errors: data, message } = err
        const { statusCode = 500 } = err
        const listMessage: string[] = []
        data = Object.keys(data).map((key) => {
          const errorField: {
            kind: string
            message: string
            properties: any
            path: string
          } = data[key]
          const { message: defaultMessage, properties: values } = errorField
          let { path = key, kind = 'invalid' } = errorField
          if (statusCode === 500) {
            const castError = [
              'Number',
              'String',
              'Boolean',
              'ObjectID',
              'Date',
            ]
            if (castError.includes(kind)) kind = `is${kind}`
          }
          kind = kind.replace(/length$/i, '')
          path = path.replace(/\.\d+$/, '')
          let id = [kind, path]
          if (controllerName) {
            controllerName = controllerName
              .split('-')
              .map((word, i) =>
                i === 0 ? word : word[0].toUpperCase() + word.slice(1),
              )
              .join('')
            id = [controllerName, ...id]
          }
          listMessage.push(defaultMessage)
          return { id: id.join('.'), defaultMessage, values }
        })
        if (!message) message = listMessage.join('. ')
        return {
          status: errorName as string,
          statusCode: 400,
          data,
          message,
        }
      },
      default: (err) => {
        logger.error(err.message || err)
        return {
          status: 'Unknow error',
          statusCode: 500,
          message: (err.message as string) || 'Please try later',
        }
      },
    }

    const factory =
      error && error.name && adapter[error.name]
        ? adapter[error.name]
        : adapter.default

    res.status(200).send(factory(error)).end()
  }
  public PageNotFound(req: Request, res: Response, _err: ErrorRequestHandler) {
    res
      .status(404)
      .send({ message: `Route ${req.url} Not found.` })
      .end()
  }
}

export default new ErrorHandler()
