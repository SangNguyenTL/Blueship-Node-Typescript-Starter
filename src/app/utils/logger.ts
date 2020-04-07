import colors from 'colors'
import winston, { format } from 'winston'

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ level: defaultLevel, message: defaultMessage, timestamp }) => {
        const colorTexts = [
          { regex: /\b(\w+ing|debug)\b/i, color: colors.blue },
          { regex: /\b(\w+ed)\b/i, color: colors.yellow },
          { regex: /\b(success|successfully|info)\b/, color: colors.green },
          { regex: /\b(fail\w+|error)\b/i, color: colors.red },
        ]
        let message = defaultMessage
        let level = defaultLevel
        colorTexts.forEach((obj) => {
          message = message.replace(obj.regex, obj.color('$1'))
          level = level.replace(obj.regex, obj.color('$1'))
        })
        return `${timestamp} [${level}] ${message}`
      },
    ),
  ),
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    }),
    new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
  ],
})

const { info, debug, warn, error } = logger
const lsLogCaller: { [key: string]: winston.LeveledLogMethod } = {
  info,
  debug,
  warn,
  error,
}
Object.keys(lsLogCaller).forEach((name) => {
  const oldCaller = lsLogCaller[name]
  // tslint:disable-next-line: align
  ;(logger as any)[name] = function (msg: string) {
    const fileAndLine = traceCaller(1)
    return oldCaller.call(this, `${fileAndLine} - ${msg}`)
  }
})

function traceCaller(lineNumber: number) {
  if (isNaN(lineNumber) || lineNumber < 0) lineNumber = 1
  lineNumber += 1
  let stack = new Error().stack as string
  let startIndexOfCallerName = stack.indexOf('\n', 5)
  while (lineNumber--) {
    startIndexOfCallerName = stack.indexOf('\n', startIndexOfCallerName + 1)
    if (startIndexOfCallerName < 0) {
      startIndexOfCallerName = stack.lastIndexOf('\n', stack.length)
      break
    }
  }
  let endIndexOfCallerName = stack.indexOf('\n', startIndexOfCallerName + 1)
  if (endIndexOfCallerName < 0) endIndexOfCallerName = stack.length
  startIndexOfCallerName = Math.max(
    stack.lastIndexOf(' ', endIndexOfCallerName),
    stack.lastIndexOf('/', endIndexOfCallerName),
  )
  endIndexOfCallerName = stack.lastIndexOf(':', endIndexOfCallerName)
  stack = stack.substring(startIndexOfCallerName + 1, endIndexOfCallerName)
  return stack
}

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level')
}

export default logger
