import Bcrypt from '@/app/services/Bcrypt'
import mongoose from 'mongoose'
import BeautifulUnique from 'mongoose-beautiful-unique-validation'

export const PrivateFields = {
  email: {
    type: String,
    unique: 'Email {VALUE} already exists',
    required: true,
  },
  role: { type: Number, ref: 'Role', default: 1 },
}

const userSchema = new mongoose.Schema(
  {
    ...PrivateFields,
    password: { type: String },
    firstName: { type: String, required: true, maxlength: 60 },
    lastName: { type: String, required: true, maxlength: 60 },
    avatar: String,
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

userSchema.plugin(BeautifulUnique)

function preFindUser(next: any) {
  this.populate('role')
  next()
}

userSchema.pre('findOne', preFindUser)
userSchema.pre('find', preFindUser)

userSchema.post('save', async (doc, next) => {
  await doc.populate('role').execPopulate()
  next()
})

const comparePassword: comparePasswordFunction = function (candidatePassword) {
  return new Bcrypt(this.password).compare(candidatePassword)
}

userSchema.methods.comparePassword = comparePassword

const hasPermission: hasPermissionFunction = function (possiblePermissions?) {
  if (!possiblePermissions) return true
  const { role } = this as IUser
  const { permissions: ownPers = [], _id } = role
  if (_id === 0) return true
  return possiblePermissions.some((per) => ownPers.includes(per))
}
userSchema.methods.hasPermission = hasPermission

const hasRole: hasRole = function (subRoles) {
  const { role } = this as IUser
  return subRoles.includes(role.id)
}
userSchema.methods.hasRole = hasRole

userSchema.set('toJSON', {
  transform: (_: IUser, ret: { [key: string]: any }) => {
    delete ret.__v
    ret.id = ret._id
    delete ret.password
    for (const v in ret) {
      if (!ret[v]) delete ret[v]
    }
  },
})

const User = mongoose.model<IUser>('User', userSchema)
export default User
