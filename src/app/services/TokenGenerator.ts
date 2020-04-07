import User from '@/app/models/User'
import jwt from 'jsonwebtoken'

class TokenGenerator {
  private secret: string
  private options: any
  constructor(secret: string = '', options?: jwt.SignOptions) {
    this.secret = secret
    this.options = options || {} // algorithm + keyid + noTimestamp + expiresIn + notBefore
  }
  /**
   * sign
   */
  public sign(payload: object, signOptions?: object) {
    const jwtSignOptions = { ...signOptions, ...this.options }
    return jwt.sign(payload, this.secret, jwtSignOptions)
  }

  public async refresh(token: string, refreshOptions?: any) {
    const email =
      refreshOptions && typeof refreshOptions.email === 'string'
        ? refreshOptions.email.slice(0)
        : false
    delete refreshOptions.email
    const jwtSignOptions = { ...refreshOptions, ...this.options }
    const payload: any = jwt.verify(token, this.secret, jwtSignOptions)
    const user = await User.findById(payload.id).exec()
    if (!user) throw new Error('User not found.')
    if (user.email !== email) {
      throw new Error('Token is invalid.')
    }
    delete payload.iat
    delete payload.exp
    delete payload.nbf
    delete payload.jti
    return jwt.sign(payload, this.secret, jwtSignOptions)
  }
}

export default TokenGenerator
