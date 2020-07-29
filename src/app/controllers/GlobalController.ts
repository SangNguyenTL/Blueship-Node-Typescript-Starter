import config from '@/app/config/index'
import AbstractController from '@/app/declares/AbstractController'
import User from '@/app/models/User'
import Bcrypt from '@/app/services/Bcrypt'
import ResponseResult from '@/app/services/ResponseResult'
import TokenGenerator from '@/app/services/TokenGenerator'
import GlobalValidationSchema from '@/app/validates/GlobalValidationSchema'
import { NextFunction, Request, Response } from 'express-serve-static-core'
import moment from 'moment'
import passport from 'passport'
const { JWT_SECRET } = config

class GlobalController extends AbstractController<any> {
  private tokenGenerator: TokenGenerator

  private expiresIn: string | number

  constructor() {
    super()
    this.expiresIn = 60 * 60 * 24 * 30
    this.tokenGenerator = new TokenGenerator(JWT_SECRET, {
      issuer: 'ApiAuth',
      expiresIn: this.expiresIn,
    })
    this.handleDoneLogin = this.handleDoneLogin.bind(this)
  }

  protected generateMethods(): IMethod[] {
    return [
      {
        path: 'sign-in',
        isRoot: true,
        _ref: this.routeSigin.bind(this),
        type: 'POST',
        authorized: false,
        validationSchema: GlobalValidationSchema.SIGNIN,
      },
      {
        path: 'sign-up',
        isRoot: true,
        _ref: this.postSignup.bind(this),
        type: 'POST',
        authorized: false,
        validationSchema: GlobalValidationSchema.SIGNUP,
      },
      {
        path: 'refresh-token',
        isRoot: true,
        _ref: this.routeRefreshToken.bind(this),
        type: 'POST',
        authorized: true,
        ignoreExpiration: true,
      },
    ]
  }

  private async routeRefreshToken(
    { user }: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleDoneLogin(
      'Refresh tokken successfully',
      user as IUser,
      res,
      next
    )
  }

  private async postSignup(
    { body: { email, password }, body }: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = await User.create({
      ...body,
      email,
      password: await new Bcrypt(password).hash(),
      role: 1,
    })
    this.handleDoneLogin('Sign up member successfully', user, res, next)
  }

  private routeSigin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      const errors = err || info
      if (errors) {
        return next({
          statusCode: 401,
          name: 'ValidationError',
          errors,
        })
      }
      req.login(user, { session: false }, async (e) =>
        this.handleDoneLogin('Sign in successfully', user, res, next, e)
      )
    })(req, res)
  }

  private async handleDoneLogin(
    message: string,
    user: IUser | null,
    res: Response,
    next: NextFunction,
    err?: Error
  ) {
    if (!err && user) {
      // generate a signed son web token with the contents of user object and return it in the response
      try {
        res.send(
          new ResponseResult({
            message,
            data: {
              user: user.toObject(),
              token: this.tokenGenerator.sign({
                id: user._id,
              }),
              expiresIn: moment().add(this.expiresIn, 'seconds').unix(),
            },
          })
        )
      } catch (error) {
        next(error)
      }
    } else next(err)
  }
}

export default new GlobalController()
