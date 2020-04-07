import 'express-serve-static-core'

declare module 'express-serve-static-core' {
    interface Request {
        controllerName?: string
        exData?: any
    }
}