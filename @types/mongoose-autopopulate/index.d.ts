
interface IAutoPopulateOpts {
    autopopulate?: boolean | { select: string }
}

declare module 'mongoose-autopopulate' {
    import mongoose = require('mongoose')
    const _: (schema: mongoose.Schema) => void
    export = _
}
