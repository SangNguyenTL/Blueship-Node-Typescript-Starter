import { NextFunction, Request, Response } from 'express-serve-static-core'
import isPromise from 'is-promise'
import { Many } from 'lodash'
import flatten from 'lodash/flatten'
import logger from './logger'

export type Next = NextFunction
export type RequestHandler = (
  req: Request,
  res: Response,
  next: Next
) => Promise<void> | void
export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: Next
) => void
export type Middleware = RequestHandler | ErrorHandler

export type Handler = Many<Middleware>

/**
 * Compose an array of middleware handlers into a single handler.
 */
export function compose(...handlers: Handler[]): RequestHandler {
  const middleware = generate(handlers)

  return (req: Request, res: Response, done: Next) =>
    middleware(null, req, res, done)
}

/**
 * Wrap middleware handlers.
 */
export function errors(...handlers: Handler[]): ErrorHandler {
  return generate(handlers)
}

/**
 * Generate a composed middleware function.
 */
function generate(handlers: Handler[]) {
  const stack = flatten(handlers)

  for (const handler of stack) {
    if ((typeof handler as any) !== 'function') {
      throw new TypeError('Handlers must be a function')
    }
  }

  return function middleware(
    errMain: Error | null,
    req: Request,
    res: Response,
    done: Next
  ) {
    let index = -1

    function dispatch(pos: number, err?: Error | null): void {
      const handler = stack[pos]

      index = pos

      if (index === stack.length) return done(err)

      function next(ne?: any) {
        if (pos < index) {
          throw new TypeError('`next()` called multiple times')
        }

        return dispatch(pos + 1, ne)
      }

      try {
        if (handler.length === 4) {
          if (err) {
            return (handler as ErrorHandler)(err, req, res, next)
          }
        } else {
          if (!err) {
            const ret = (handler as RequestHandler)(req, res, next)
            if (isPromise(ret)) {
              ret.catch((e) => next(e))
            }
            return
          }
        }
      } catch (e) {
        // Avoid future errors that could diverge stack execution.
        if (index > pos) throw e

        logger.debug('try..catch', e)

        return next(e)
      }

      return next(err)
    }

    return dispatch(0, errMain)
  }
}
