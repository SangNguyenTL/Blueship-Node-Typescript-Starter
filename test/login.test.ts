import request from 'supertest'
import app from '../src/express'

describe('POST /login', () => {
  it('should login success', (done) => {
    request(app)
      .post('/login')
      .send({ email: 'user@mailinator.com', password: '12345678@Ab' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) throw err
        done()
      })
  })
})
