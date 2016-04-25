const app = require('koa')()
const path = require('path')
const router = require('koa-router')()
const fs = require('fs')
const exec = require('child_process').exec
const debug = require('debug')('proxy')

const pkg = require('./package.json')
const versionPath = path.join(__dirname, 'VERSION')
const commit = fs.existsSync(versionPath) ? fs.readFileSync(versionPath, 'utf8').trim() : null

app.use(require('koa-static')(path.join(__dirname, 'public')))

router.get('/healthcheck', function * () {
  this.body = {
    name: pkg.name,
    version: pkg.version,
    commit
  }
})

app.use(router.routes())

app.listen(3000)



debug('Starting nignx in subprocess')

const quit = (code) => {
  debug('Quiting process as an error occurred')
  process.exit(code || 1)
}

const nginx = exec('nginx -g "daemon off;"', {}, (err, stdout, stderr) => {
  debug('stdout', stdout)
  debug('stderr', stderr)

  if (err !== null) {
    debug('exec error', err)
    quit()
  }
})
// nginx.on('close', (code, signal) => {
//   debug('nignx process close event', code, signal)
//   quit(code)
// })
//
// nginx.on('close', (code, signal) => {
//   debug('nignx process close event', code, signal)
//   quit(code)
// })
//
// nginx.on('error', (err) => {
//   debug('nignx process error event', err)
//   quit()
// })
//
// nginx.on('exit', (code, signal) => {
//   debug('nignx process exit event', code, signal)
//   quit(code)
// })
