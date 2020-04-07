import { Schema } from 'express-validator'

class ValidationSchemaObject {
  static LOGIN: Schema = {
    email: {
      normalizeEmail: true,
      isEmail: {
        errorMessage: ['isEmail', 'Please provide a valid email.'],
      },
      isLength: {
        options: {
          max: 255,
        },
        errorMessage: [
          'max',
          255,
          'Email must be contained the most {max} characters.',
        ],
      },
    },
    password: {
      exists: {
        errorMessage: ['required', 'Password must be provided.'],
      },
    },
  }
  static SIGNIN: Schema = {
    email: {
      normalizeEmail: true,
      isEmail: {
        errorMessage: ['isEmail', 'Please provide a valid email.'],
      },
      isLength: {
        options: {
          max: 255,
        },
        errorMessage: [
          'max',
          255,
          'Email must be contained the most {max} characters.',
        ],
      },
    },
    password: {
      exists: {
        errorMessage: ['required', 'Password must be provided.'],
      },
    },
  }
  static SIGNUP: Schema = {
    email: {
      normalizeEmail: true,
      isEmail: {
        errorMessage: 'Please provide a valid email.',
      },
      isLength: {
        options: {
          max: 255,
        },
        errorMessage: [
          'max',
          255,
          'Email must be contained the most {max} characters.',
        ],
      },
    },
    password: {
      isString: {
        errorMessage: ['required', 'Password must be provided.'],
      },
      isLength: {
        options: {
          min: 6,
        },
        errorMessage: [
          'min',
          6,
          'Password must be contained at least {min} characters.',
        ],
      },
    },
    firstName: {
      isString: {
        errorMessage: ['isString', 'Please provide a valid first name.'],
      },
      trim: {
        options: ' ',
      },
      isLength: {
        options: {
          max: 50,
        },
        errorMessage: [
          'max',
          50,
          'First name must be contained the most {max} characters.',
        ],
      },
    },
    lastName: {
      isString: {
        errorMessage: ['isString', 'Please provide a valid last name '],
      },
      trim: {
        options: ' ',
      },
      isLength: {
        options: {
          max: 50,
        },
        errorMessage: [
          'max',
          50,
          'Last name must be contained the most {max} characters.',
        ],
      },
    },
  }
}

export default ValidationSchemaObject
