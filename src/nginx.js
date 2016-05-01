const exec = require('child_process').exec
const debug = require('debug')('proxy:nginx')

debug('Starting nignx in subprocess')

const quit = (code) => {
  debug('Quiting process as an error occurred')
  process.exit(code || 1)
}

const execCb = (err, stdout, stderr) => {
  debug('stdout', stdout)
  debug('stderr', stderr)

  if (err !== null) {
    debug('exec error', err)
    quit()
  }
}

module.exports = () => {

  const nginx = exec('nginx -g "daemon off;"', execCb)

  nginx.on('close', (code, signal) => {
    debug('process close event', code, signal)
    quit(code)
  })

  nginx.on('close', (code, signal) => {
    debug('process close event', code, signal)
    quit(code)
  })

  nginx.on('error', (err) => {
    debug('process error event', err)
    quit()
  })

  nginx.on('exit', (code, signal) => {
    debug('process exit event', code, signal)
    quit(code)
  })

  return () => {
    exec("nginx -s reload", execCb)
    debug('reloaded')
  }
}
