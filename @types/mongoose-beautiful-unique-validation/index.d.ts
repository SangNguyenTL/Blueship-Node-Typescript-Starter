interface IBeautifulUnique {
}

declare module 'mongoose-beautiful-unique-validation' {
    import mongoose = require('mongoose')
    const _: (
        schema: mongoose.Schema,
        Options?: { defaultMessage: string },
    ) => void
    export = _
}