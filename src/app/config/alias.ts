import moduleAlias from 'module-alias'
import path from 'path';

const { NODE_ENV } = process.env;

const pathBundle = NODE_ENV !== 'production' ? "src" : "dist";
moduleAlias.addAlias("@", path.join(__dirname, `../../../${pathBundle}`))