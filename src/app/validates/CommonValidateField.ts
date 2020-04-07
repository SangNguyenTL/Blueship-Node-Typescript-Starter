import validate from 'mongoose-validator'

export const validatePhoneNumber = validate({
  validator: 'isMobilePhone',
  type: 'isMobilePhone',
  passIfEmpty: true,
  arguments: 'any',
  message: '{PATH} is invalid',
})

export const validateEmail = validate({
  validator: 'isEmail',
  type: 'isEmail',
  passIfEmpty: true,
  message: '{PATH} is invalid',
})

export const validateImageType = validate({
  type: 'isURLImage',
  validator: (v: string | any) =>
    typeof v === 'string' && /\.(jpg|jpeg|png|gif)$/i.test(v),
  message: 'Please provide a valid image URL',
  passIfEmpty: true,
})

export const isISO31661Alpha2 = validate({
  validator: 'isISO31661Alpha2',
  type: 'isISO31661Alpha2',
  passIfEmpty: true,
  message: 'Please provide a valid code (alpha-2 code).',
})

export const isISO31661Alpha3 = validate({
  validator: 'isISO31661Alpha3',
  type: 'isISO31661Alpha3',
  passIfEmpty: true,
  message: 'Please provide a valid alpha-3 code.',
})
