import * as shell from 'shelljs'

if (!shell.test('-e', 'dist')) {
  shell.mkdir('dist')
}
shell.rm('-rf', 'dist/app/controllers', 'dist/app/models')
shell.cp('-R', 'src/public', 'dist/')
shell.cp('-R', 'src/database', 'dist/')
