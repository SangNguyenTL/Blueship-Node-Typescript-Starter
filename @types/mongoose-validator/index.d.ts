type validator<T> = (v: T) => boolean

declare module 'mongoose-validator' {
    function validate(option: {
        validator: string | validator<any>
        arguments?: (string | number)[] | string | number
        passIfEmpty?: boolean
        message?: string
        type?: string
    }): any

    export = validate
}
