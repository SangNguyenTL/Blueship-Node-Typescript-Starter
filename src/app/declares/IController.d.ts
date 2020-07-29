import { RequestHandler } from 'express-serve-static-core'
import { Schema } from 'express-validator'

declare global {
  interface IMethod {
    path?: string
    possiblePers?: string[]
    body?: any
    authorized?: boolean
    ignoreExpiration?: boolean
    type?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    isRoot?: boolean
    _ref: RequestHandler
    middleware?: RequestHandler[]
    validationSchema?: Schema
  }
}
