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
  { versionKey: false, timestamps: true }
)
roleSchema.plugin(BeautifulUnique)
const Role = mongoose.model<IRole>('Role', roleSchema)

export default Role
