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
        logger.error(`Import ${file} failed`)
        return
      })
      if (modelModule)
        return { fileName, model: modelModule.default as Model<any, {}> }
    }
    return
  }).then((result) => {
    logger.debug('Imported models successfully')
    return result.filter(Boolean) as ModelType[]
  })
}

function migrate(modelObjects: ModelType[]) {
  const seedPaths = path.resolve(__dirname, 'database/seeds')

  return Bluebird.map(
    modelObjects,
    async (modelObject) => {
      const { fileName, model } = modelObject
      const dataModule = await import(
        path.join(seedPaths, `${fileName}.json`)
      ).catch(() => {
        logger.debug(`${fileName} data not found.`)
        return
      })
      if (!dataModule) return
      const { default: data } = dataModule
      const numberOfRows = await model.countDocuments()
      if (numberOfRows > 0) return
      logger.debug(`Migrating data for ${fileName}`)
      return model
        .create(data)
        .then(() => {
          logger.debug(`Migrated data for ${fileName} successfully`)
        })
        .catch((err) => {
          logger.error(`Migrated data for ${fileName} unsucessfully`)
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
