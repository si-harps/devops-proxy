const path = require('path')
const fs = require('fs')

const pkg = require('../package.json')
const versionPath = path.join(__dirname, '..', 'VERSION')
const commit = fs.existsSync(versionPath) ? fs.readFileSync(versionPath, 'utf8').trim() : null


module.exports = () => {
  const app = require('koa')()
  const router = require('koa-router')()

  app.use(require('koa-static')(path.join(__dirname, '..', 'public')))

  router.get('/healthcheck', function * () {
    this.body = {
      name: pkg.name,
      version: pkg.version,
      commit
    }
  })

  app.use(router.routes())

  return app
}
