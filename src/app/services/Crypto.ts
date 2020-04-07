import crypto from 'crypto'

export default class Crypto {
  public static encrypt(text: string | number) {
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const bufferPassword = Buffer.from(this.password, 'utf8')
    const cipher = crypto.createCipheriv(this.algorithm, bufferPassword, iv)
    let encrypted = cipher.update(Buffer.from(String(text), 'utf8'))
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`
  }

  public static decrypt(text: string | any) {
    if (typeof text !== 'string' || text.split(':').length !== 2) {
      return text
    }
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift() as string, 'hex')
    const bufferPassword = Buffer.from(this.password, 'utf8')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(this.algorithm, bufferPassword, iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }
  private static algorithm = 'aes-256-cbc'
  private static password = '5f4dcc3b5aa765d61d8327deb882cf99'
  private static IV_LENGTH = 16 // For AES, this is always 16
}
