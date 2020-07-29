import config from '@/app/config/index'

import User from '@/app/models/User'
import passport from 'passport'
import passportJWT from 'passport-jwt'

const ExtractJWT = passportJWT.ExtractJwt
const JWTStrategy = passportJWT.Strategy

function jwtStrategy(options?: {
  ignoreExpiration: boolean
}): passport.Strategy {
  let jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken()
  if (config.JWT_HEADER !== 'Bearer') {
    jwtFromRequest = ExtractJWT.fromHeader(config.JWT_HEADER)
  }
  let defaultOptions: passportJWT.StrategyOptions = {
    jwtFromRequest,
    secretOrKey: config.JWT_SECRET,
    issuer: config.JWT_ISSUER,
  }
  if (typeof options === 'object') {
    defaultOptions = {
      ...defaultOptions,
      ...options,
    }
  }

  return new JWTStrategy(defaultOptions, async ({ id }, cb) => {
    // find the user in db if needed
    let user
    let err
    try {
      user = await User.findById(id).exec()
      if (!user) {
        throw { user: { kind: 'not.found', message: 'User not found' } }
      }
    } catch (errors) {
      err = errors
    }
    return cb(err, user)
  })
}

passport.use(jwtStrategy())

passport.use('jwt-ignoreExpiration', jwtStrategy({ ignoreExpiration: true }))
