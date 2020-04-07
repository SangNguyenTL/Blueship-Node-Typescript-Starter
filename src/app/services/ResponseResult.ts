import { SUCCESS, SUCCESS_CODE } from '@/app/declares/Enums'

export default class ResponseResult {
  public statusCode: number = SUCCESS_CODE
  public message?: string
  public status: string = SUCCESS
  public data?: any[] | any

  public total?: number

  constructor({
    status,
    statusCode,
    message,
    data,
    total,
  }: {
    status?: string
    statusCode?: number
    message?: string
    data?: any
    total?: number
  } = {}) {
    this.status = status || this.status
    this.statusCode = statusCode || this.statusCode
    this.message = message
    this.data = data
    this.total = total
  }
}
