import './app/config/alias'
// tslint:disable-next-line: ordered-imports
import config from '@/app/config/index'
import { getIps } from '@/app/utils'
const { ENVIRONMENT } = config
import logger from '@/app/utils/logger'
import app from '@/express'
import scheduleList from '@/schedule'
import errorhandler from 'errorhandler'
import displayRoutes from 'express-routemap'
import schedule from 'node-schedule'

app
  .init()
  .then((express) => {
    /**
     * Error Handler. Provides full stack - remove for production
     */
    if (ENVIRONMENT !== 'production') {
      // only use in development
      express.use(errorhandler())
      displayRoutes(express)
    }

    /**
     * Start Express server.
     */
    express.listen(express.get('port'), () => {
      // tslint:disable-next-line: no-console
      console.log(
        '  App is running at http://localhost:%d in %s mode',
        express.get('port'),
        express.get('env')
      )
      getIps().forEach((ip) => {
        // tslint:disable-next-line: no-console
        console.log(
          '  App is running at http://%s:%d in %s mode',
          ip,
          express.get('port'),
          express.get('env')
        )
      })
      // tslint:disable-next-line: no-console
      console.log('  Press CTRL-C to stop\n')
      scheduleList.forEach((sch) => {
        schedule.scheduleJob(sch.cronFormat, sch.function)
      })
    })
  })
  .catch((err) => {
    logger.error(err.message)
    process.exit(1)
  })
