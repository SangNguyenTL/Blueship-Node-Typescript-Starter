import { NextCountFunction } from 'mongoose-auto-increment-reworked'

declare module 'mongoose' {
    interface ConnectionOptions {
        useUnifiedTopology?: boolean
    }

    interface Model<T> {
        _nextCount(): NextCountFunction
    }

    interface SchemaTypeOpts<T> extends IBeautifulUnique, IAutoPopulateOpts { }

}

