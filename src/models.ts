import Bluebird from 'bluebird'
import fs from 'fs'
import path from 'path'
import logger from './app/utils/logger'

export default async function () {
  const modelsPath = path.resolve(__dirname, 'app/models')
  logger.debug('Importing models')
  return Bluebird.map(fs.readdirSync(modelsPath), async (file) => {
    if (!/\.d\.ts$/.test(file) && /\.(ts|js)$/.test(file)) {
      try {
        const model = await import(modelsPath + '/' + file).catch(() =>
          logger.error(`Import ${file} failed`),
        )
        if (typeof model.generate === 'function') await model.generate()
      } catch (error) { }
    }
  }).then(() => logger.debug('Imported models successfully'))
}
