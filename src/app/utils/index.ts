import lodash from 'lodash'
import { Schema, SchemaDefinition } from 'mongoose'
import os from 'os'

export function isString(input: any): input is string {
  return Boolean(typeof input === 'string')
}

export function isBlank(input: string) {
  return input.length === 0
}

export function chunkArray<T>(arr: T[], chunkSize: number) {
  const chunks = []
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize))
    }
  }
  return chunks
}

export function generateFields(
  schema: Schema,
  schemaDefinition: SchemaDefinition,
  possibleFields: string[],
) {
  return Object.keys(schemaDefinition)
    .filter((nameField) => {
      if (!possibleFields.includes(nameField)) return false
      const schemaType: any = schema.path(nameField)
      return schemaType.instance
    })
    .map((nameField) => {
      const schemaType: any = schema.path(nameField)
      let type = schemaType.instance
      if (type === 'Array') type = [schemaType.caster.instance]
      const {
        options: { ref },
      } = schemaType
      return { name: nameField, type, ...(ref ? { ref } : {}) }
    })
}

export function getIps() {
  const networkInterfaces = os.networkInterfaces()
  return lodash.flatMap(
    Object.keys(networkInterfaces)
      .map((inet) => networkInterfaces[inet])
      .map((addresses) =>
        addresses
          .filter((address) => !address.internal && address.family === 'IPv4')
          .map((address) => address.address),
      ),
  )
}
