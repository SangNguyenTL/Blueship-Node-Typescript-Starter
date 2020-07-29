import moduleAlias from 'module-alias'
import path from 'path'

const { NODE_ENV } = process.env

const pathBundle = path.join(
  __dirname,
  !['production', 'development'].includes(NODE_ENV as string)
    ? `../../../src`
    : '../../'
)
moduleAlias.addAlias('@', pathBundle)
