import Bluebird from 'bluebird'
import { Model } from 'mongoose'
import fs from 'fs'
import path from 'path'
import logger from './app/utils/logger'

type ModelType = {
  fileName: string
  model: Model<any, {}>
}

async function initialModels() {
  const modelPaths = path.resolve(__dirname, 'app/models')
  return Bluebird.map(fs.readdirSync(modelPaths), async (file) => {
    if (!/\.d\.ts$/.test(file) && /\.(ts|js)$/.test(file)) {
      const [fileName] = file.split('.')
      const modelModule = await import(modelPaths + '/' + file).catch(() => {
        logger.info(`Import ${file} failed`)
        return
      })
      if (modelModule)
        return { fileName, model: modelModule.default as Model<any, {}> }
    }
    return
  }).then((result) => {
    logger.info('Imported models successfully')
    return result.filter(Boolean) as ModelType[]
  })
}

function migrate(modelObjects: ModelType[]) {
  const seedPaths = path.resolve(__dirname, 'database/seeds')

  return Bluebird.map(
    modelObjects,
    async (modelObject) => {
      const { fileName, model } = modelObject
      const numberOfRows = await model.countDocuments()
      if (numberOfRows > 0) {
        logger.info(
          `${model.modelName} is already had data. Skip the migration.`
        )
        return
      }
      logger.info(`${model.modelName} is not had data, active the migration.`)
      const dataModule = await import(
        path.join(seedPaths, `${fileName}.json`)
      ).catch(() => {
        logger.info(`${fileName} data not found. Skip the migration`)
        return
      })
      if (!dataModule) return
      const { default: data } = dataModule
      return model
        .create(data)
        .then(() => {
          logger.info(`Migrated data for ${fileName} successfully`)
        })
        .catch((err) => {
          logger.info(`Migrated data for ${fileName} unsucessfully`)
          logger.error(err.message)
        })
    },
    { concurrency: 1 }
  )
}

export default async function () {
  const models = await initialModels()
  return migrate(models)
}
