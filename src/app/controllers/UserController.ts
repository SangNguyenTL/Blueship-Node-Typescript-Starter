import AbstractController from '@/app/declares/AbstractController'
import AdvancedError from '@/app/declares/AdvancedError'
import User, { PrivateFields } from '@/app/models/User'
import ResponseResult from '@/app/services/ResponseResult'
import { Request, Response } from 'express-serve-static-core'
import { Model } from 'mongoose'
import omit from 'omit.js'

class UserController extends AbstractController<Model<IUser>> {
  protected generateMethods(): IMethod[] {
    this.getCurrentUser = this.getCurrentUser.bind(this)
    return [
      { path: 'getCurrentUser', _ref: this.getCurrentUser, type: 'GET' },
      {
        path: ':id',
        _ref: this.update,
        type: 'PUT',
        possiblePers: ['USER_UPDATE'],
      },
    ]
  }
  /**
   * getCurrentUser
   */
  protected async getCurrentUser(req: Request, res: Response) {
    const user = req.user as IUser
    if (!user) {
      throw new AdvancedError({
        user: {
          kind: 'not.found',
          message: 'User not found',
        },
      })
    }
    res.send(
      new ResponseResult({
        message: 'Successfully get user information',
        data: user,
      }),
    )
  }

  /**
   * update
   */
  protected async update({ body, params: { id } }: Request, res: Response) {
    const subUser = await User.findById(id).exec()
    if (!subUser) {
      throw new AdvancedError({
        user: {
          kind: 'not.found',
          message: 'User not found',
        },
      })
    }
    await subUser.set(omit(body, Object.keys(PrivateFields))).save()
    res.send(
      new ResponseResult({
        message: 'Successfully updated information',
        data: subUser,
      }),
    )
  }
}

export default new UserController(User)
