import logger from '@/app/utils/logger'
import mongoose from 'mongoose'
import BeautifulUnique from 'mongoose-beautiful-unique-validation'

const roleSchema = new mongoose.Schema(
  {
    _id: Number,
    name: {
      type: String,
      required: [true, 'Role name must be provided.'],
      index: true,
    },
    permissions: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { versionKey: false, timestamps: true },
)
roleSchema.plugin(BeautifulUnique)
const Role = mongoose.model<IRole>('Role', roleSchema)

export async function generate() {
  logger.debug('Checking the role schema')
  const numbersOfRole = await Role.countDocuments()
  if (numbersOfRole > 0) return
  logger.debug('Generate data to the role schema')
  const DEFAULT_ROLES: IRoleForm[] = [
    {
      _id: 0,
      name: 'Admin',
      permissions: [],
      status: 'ACTIVE',
    },
    {
      _id: 1,
      name: 'User',
      permissions: [],
      status: 'ACTIVE',
    },
  ]
  return Role.create(DEFAULT_ROLES)
    .then(() => {
      logger.debug('Insert roles successfully')
    })
    .catch((err) => {
      logger.error('Insert roles failed')
      throw err
    })
}

export default Role
