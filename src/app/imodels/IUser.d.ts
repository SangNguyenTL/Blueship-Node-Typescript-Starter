import * as mongoose from 'mongoose'

declare global {
  type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>
  type hasPermissionFunction = (possiblePermissions?: string[]) => boolean
  type hasRole = (role: string) => boolean

  interface IUser extends mongoose.Document {
    _id: mongoose.Types.ObjectId
    email: string
    role: IRole
    firstName: string
    lastName: string
    avatar: string
    comparePassword: comparePasswordFunction
    hasPermission: hasPermissionFunction
    hasRole: hasRole
  }

  interface IRoleForm {
    _id: number
    name: string
    permissions: string[]
    status: 'ACTIVE' | 'DISABLE'
  }

  interface IRole extends mongoose.Document, IRoleForm {
    _id: number
  }
}
