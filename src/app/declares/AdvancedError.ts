export interface IValidationError {
  [key: string]: {
    kind: string
    path?: string
    message: string
    properties?: {
      [key: string]: any
    }
  }
}

export default class AdvancedError extends Error {
  public name: string
  public statusCode: number
  public errors: IValidationError
  constructor(errors: IValidationError) {
    super('ValidationError')
    this.name = 'ValidationError'
    this.statusCode = 400
    this.errors = errors
  }

  /**
   * setName
   */
  public setName(name: string) {
    this.name = name
  }

  /**
   * setStatusCode
   */
  public setStatusCode(code: number) {
    this.statusCode = code
  }
}
