class DataNotFoundError extends Error {
  constructor(message: string = 'Data not found') {
    super('DataNotFoundError')
    this.name = 'DataNotFoundError'
    this.message = message
  }
}

export default DataNotFoundError
