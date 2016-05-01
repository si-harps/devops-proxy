const exec = require('child_process').exec
const debug = require('debug')('proxy:nginx')

debug('Starting nignx in subprocess')

const quit = (code) => {
  debug('Quiting process as an error occurred')
  process.exit(code || 1)
}

module.exports = () => {
  const nginx = exec('nginx -g "daemon off;"', {}, (err, stdout, stderr) => {
    debug('stdout', stdout)
    debug('stderr', stderr)

    if (err !== null) {
      debug('exec error', err)
      quit()
    }
  })

  nginx.on('close', (code, signal) => {
    debug('nignx process close event', code, signal)
    quit(code)
  })

  nginx.on('close', (code, signal) => {
    debug('nignx process close event', code, signal)
    quit(code)
  })

  nginx.on('error', (err) => {
    debug('nignx process error event', err)
    quit()
  })

  nginx.on('exit', (code, signal) => {
    debug('nignx process exit event', code, signal)
    quit(code)
  })


  exec("nginx -s reload")
  debug('ningx.conf updated')
  
}
