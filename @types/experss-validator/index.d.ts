import * as expressValidator from 'express-validator'

interface IMessageError {
    [key: string]: any
    kind: string
    message?: string
}

declare module 'express-validator' {
    type ValidationError =
        | {
            location?: undefined
            param: '_error'
            msg: IMessageError
            nestedErrors: ValidationError[]
        }
        | {
            location: Location
            param: string
            value: any
            msg: IMessageError
        }
}
