import User from '@/app/models/User'
import passport from 'passport'
import passportLocal from 'passport-local'

const LocalStrategy = passportLocal.Strategy

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      let err
      let user
      try {
        user = await User.findOne({ email: email.toLowerCase() }).exec()
        const isMatch = user && (await user.comparePassword(password))
        if (!isMatch) {
          throw {
            'email.password': {
              kind: 'invalid',
              message: 'Email or password are invalid',
            },
          }
        }
      } catch (error) {
        err = error
      }
      return done(err, user)
    },
  ),
)
