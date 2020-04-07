import crypto from '../src/app/services/Crypto'

test('Encrypt number', () => {
  const text: any = 123
  let encrypt
  try {
    encrypt = crypto.encrypt(text)
  } catch (e) {}
  expect(encrypt).not.toBeUndefined()
})

test('Comapre encrypt number', () => {
  const text: any = 123
  let encrypt
  let secondEncrypt
  try {
    encrypt = crypto.encrypt(text)
    secondEncrypt = crypto.encrypt(text)
  } catch (e) {}
  expect(encrypt).not.toBe(secondEncrypt)
})

test('Comapre encrypt string', () => {
  const text: any = 'asd'
  let encrypt
  let secondEncrypt
  try {
    encrypt = crypto.encrypt(text)
    secondEncrypt = crypto.encrypt(text)
  } catch (e) {}
  expect(encrypt).not.toBe(secondEncrypt)
})

test('Encrypt blank test', () => {
  const text: any = 123
  let encrypt
  try {
    encrypt = crypto.encrypt('')
  } catch (e) {}
  expect(encrypt).not.toBeUndefined()
})

test('Encrypt null value', () => {
  const text: any = 123
  let encrypt
  try {
    encrypt = crypto.encrypt(null)
  } catch (e) {}
  expect(encrypt).not.toBeUndefined()
})

test('Decrypt', () => {
  const text: any =
    'a75c246451c51c9de8943a40d48f195c:7a9f505265bb5cb1b4a0bc485fd770c7'
  let decrypt
  try {
    decrypt = crypto.decrypt(text)
  } catch (e) {}
  expect(decrypt).not.toBeUndefined()
  expect(decrypt).not.toBeNaN()
})
