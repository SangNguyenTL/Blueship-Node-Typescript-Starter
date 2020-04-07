import bcrypt from 'bcrypt'

class Hash {
  private rounds: number
  private originStr: string
  constructor(originStr: string, rounds: number = 10) {
    this.rounds = rounds
    this.originStr = originStr
  }
  public async hash() {
    return new Promise<string>((resolve, reject) =>
      bcrypt.hash(this.originStr, this.rounds, (err, hash) => {
        return err ? reject(err) : resolve(hash)
      }),
    )
  }

  public async compare(candidatePassword: string) {
    return new Promise<boolean>((resolve, reject) =>
      bcrypt.compare(
        candidatePassword,
        this.originStr,
        (err, isMatch: boolean) => {
          return err ? reject(err) : resolve(isMatch)
        },
      ),
    )
  }
}

export default Hash
