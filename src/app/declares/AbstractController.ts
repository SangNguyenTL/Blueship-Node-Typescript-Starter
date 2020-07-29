import AdvancedError from '@/app/declares/AdvancedError'
import ResponseResult from '@/app/services/ResponseResult'
import { compose } from '@/app/utils/compose-middleware'
import { NextFunction, Request, Response } from 'express-serve-static-core'
import { checkSchema, validationResult } from 'express-validator'
import { Document, Model, Types } from 'mongoose'
import { get } from 'lodash'
import logger from '../utils/logger'
import DataNotFoundError from './DataNotFoundError'

export default abstract class AbstractController<T extends Model<any>> {
  public name: string
  public methods: IMethod[] = []
  protected model: T
  protected subFilter: any[] = []
  protected fields: {
    name: string
    type: string
    ref?: any
  }[] = []
  constructor(model?: T) {
    this.processFilter = this.processFilter.bind(this)
    if (model) {
      this.model = model
      this.isOwner = this.isOwner.bind(this)
      this.list = this.list.bind(this)
      this.add = this.add.bind(this)
      this.getByID = this.getByID.bind(this)
      this.update = this.update.bind(this)
      this.remove = this.remove.bind(this)
    }
    this.generateMethods = this.generateMethods.bind(this)
    this.checkValidArguments = this.checkValidArguments.bind(this)
    this.getValidMethod = this.getValidMethod.bind(this)
    this.checkPermission = this.checkPermission.bind(this)
    this.setControllerName = this.setControllerName.bind(this)
    this.preInit = this.preInit.bind(this)
    this.preInit()
    this.methods = this.generateMethods()
  }
  public async isOwner(req: Request) {
    try {
      const {
        query: { id: idQuery },
        params: { id: idParam = idQuery as string },
        body: { id = idParam },
        user,
      } = req
      const item = await this.model.findById(id).exec()
      if (!item) throw { code: 404, modelName: this.model.modelName, id }
      let isOwner = false
      if (this.model.modelName === 'User') {
        console.log(this.model.modelName)
        isOwner = item && item.id === (user as IUser).id
      } else {
        isOwner = get(item, 'creator.id') === (user as IUser).id
      }
      if (item) {
        req.exData = item
      }
      return isOwner
    } catch (error) {
      if (error.code === 404) {
        throw new DataNotFoundError(
          `${error.modelName} id ${error.id} not found.`
        )
      }
      logger.error(error)
      return false
    }
  }
  public setControllerName(req: Request, _: Response, next: NextFunction) {
    req.controllerName = this.name
    next()
  }
  public setName(name: string) {
    this.name = name
  }
  public checkValidArguments(
    req: Request,
    _: Response,
    next: NextFunction
  ): void {
    const errors = validationResult(req)
    const check = !errors.isEmpty()
    if (check) {
      let objErrors = {}
      errors.array().forEach(({ param, msg }) => {
        let objParam = {
          path: param,
          message: msg,
          kind: 'invalid',
          properties: {},
        }
        if (Array.isArray(msg)) {
          const message = msg[msg.length - 1]
          const [kind, values]: any = msg
          objParam = { ...objParam, message, kind }
          if (msg.length === 3) {
            objParam = { ...objParam, properties: { [kind]: values } }
          }
        }
        objErrors = {
          ...objErrors,
          [param]: objParam,
        }
      })
      return next({
        errors: objErrors,
        message: 'Bad arguments',
        name: 'ValidationError',
        statusCode: 400,
      })
    } else next()
  }
  public async getValidMethod(req: Request, res: Response, next: NextFunction) {
    const {
      body: { method: methodName },
    } = req
    const user = req.user as IUser
    if (!methodName) {
      throw new AdvancedError({
        method: {
          kind: 'required',
          message: `Method must be provided.`,
          path: 'method',
        },
      })
    }
    const formatMethod = this.methods.find(
      (method) => method.path === methodName
    )
    if (!formatMethod) {
      throw new AdvancedError({
        method: {
          kind: 'not.found',
          message: `Method {methodName} not found.`,
          path: 'method',
          properties: {
            methodName,
          },
        },
      })
    }
    const {
      possiblePers,
      validationSchema,
      _ref,
      middleware: methodMid,
    } = formatMethod
    if (
      Array.isArray(possiblePers) &&
      possiblePers.length > 0 &&
      !(await this.isOwner(req)) &&
      !user.hasPermission(possiblePers)
    ) {
      throw new AdvancedError({
        method: {
          path: 'method',
          kind: 'not.permission',
          message: `You don't have permission.`,
        },
      })
    }
    const chain = []
    if (validationSchema) {
      chain.push(...checkSchema(validationSchema), this.checkValidArguments)
    }
    if (Array.isArray(methodMid)) chain.push(...methodMid)
    chain.push(_ref)
    const middleware = compose(chain)
    return middleware(req, res, next)
  }
  public async checkPermission(
    formatMethod: IMethod,
    req: Request,
    _: Response,
    next: NextFunction
  ) {
    const { user } = req
    const { possiblePers } = formatMethod
    if (
      Array.isArray(possiblePers) &&
      possiblePers.length > 0 &&
      !(await this.isOwner(req)) &&
      !(user as IUser).hasPermission(possiblePers)
    ) {
      throw new AdvancedError({
        method: {
          path: 'method',
          kind: 'not.permission',
          message: `You don't have permission.`,
        },
      })
    }
    next()
  }
  protected preInit() {}
  protected generateMethods(): IMethod[] {
    return []
  }

  protected processFilter(
    args: {
      [key: string]: any
    },
    extraFilter: {
      [key: string]: any
    } = {},
    ignoreFields?: string[]
  ): {
    [key: string]: any
  } {
    let filter = {}
    let defaultIgnoreFields: string[] = []
    const extraKeys = Object.keys(extraFilter)
    if (Array.isArray(ignoreFields)) {
      defaultIgnoreFields = [
        ...defaultIgnoreFields,
        ...ignoreFields,
        ...extraKeys,
      ]
    }
    for (const key of Object.keys(args)) {
      const field = this.fields.find(
        ({ name }) => !defaultIgnoreFields.includes(key) && name === key
      )
      if (!field) continue
      const val = this.processValue(args[key], field.type)
      if (val) {
        filter = {
          ...filter,
          [key]: val,
        }
      }
    }
    filter = { ...extraFilter, ...filter }
    return filter
  }
  protected processValue(val: any, requireType: any) {
    const adapter: {
      [key: string]: any
    } = {
      Boolean: (v: any) => Boolean(v),
      Date: (v: any) => new Date(v),
      Number: (v: any) => Number.parseFloat(v),
      ObjectId: (v: any) => new Types.ObjectId(v),
      String: (v: any) => String(v),
    }
    const engine = adapter[requireType]
    if (!engine) return
    let newVal
    if (typeof val === 'object') {
      const keys = Object.keys(val)
      if (keys.length === 0) return
      keys.forEach((key) => {
        let childVal: any[] = val[key]
        if (!childVal) return
        if (Array.isArray(childVal)) {
          childVal = val[key]
          childVal = childVal.map(engine)
        } else childVal = engine(childVal)
        newVal = {
          ...val,
          [key]: childVal,
        }
      })
    } else newVal = engine(val)
    return newVal
  }
  /**
   * list
   */
  protected async list(request: Request, res: Response) {
    res.send(
      new ResponseResult({
        data: await this.model.find(request.query).sort({ _id: 1 }).exec(),
        message: 'Get list successfully.',
      })
    )
  }
  /**
   * getByID
   */
  protected async getByID(
    {
      query: { id: idQuery },
      params: { id: idParam = idQuery as string },
      body: { id = idParam },
    }: Request,
    res: Response
  ) {
    const item: Document = await this.model.findById(id).exec()
    if (!item) {
      throw new AdvancedError({
        [this.name]: { kind: 'not.found', message: 'Item not found' },
      })
    }
    res.send(
      new ResponseResult({
        data: item,
        message: 'Get item successfully',
      })
    )
  }
  /**
   * add
   */
  protected async add({ body, user }: Request, res: Response) {
    Object.assign(body, { creator: user })
    res.send(
      new ResponseResult({
        data: await this.model.create(body),
        message: 'Add item successfully',
      })
    )
  }
  /**
   * update
   */
  protected async update(
    {
      query: { id: idQuery },
      params: { id: idParam = idQuery as string },
      body: { id = idParam, ...body },
      exData,
    }: Request,
    res: Response
  ) {
    const item: Document =
      (exData as Document) || (await this.model.findById(id).exec())
    if (!item) {
      throw new AdvancedError({
        [this.name]: { kind: 'not.found', message: 'Item not found' },
      })
    }
    item.set(body)
    await item.save()
    res.send(
      new ResponseResult({
        message: 'Update item successfully',
        data: item,
      })
    )
  }
  /**
   * remove
   */
  protected async remove(
    {
      query: { id: idQuery },
      params: { id: idParam = idQuery as string },
      body: { id = idParam },
      exData,
    }: Request,
    res: Response
  ) {
    const item: Document =
      (exData as Document) || (await this.model.findById(id).exec())
    if (!item) {
      throw new AdvancedError({
        [this.name]: { kind: 'not.found', message: 'Item not found' },
      })
    }
    await item.remove()
    res.send(
      new ResponseResult({
        message: 'Remove item successfully',
        data: item,
      })
    )
  }
}
