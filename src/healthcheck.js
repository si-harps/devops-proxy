'use strict'

const path = require('path')
const fs = require('fs')

const pkg = require('../package.json')
const versionPath = path.join(__dirname, '..', 'VERSION')
const commit = fs.existsSync(versionPath) ? fs.readFileSync(versionPath, 'utf8').trim() : null


module.exports = (consul) => {
  const app = require('koa')()
  const router = require('koa-router')()
  let availableServices = {}
  consul.on('change', services => availableServices = services)

  app.use(require('koa-static')(path.join(__dirname, '..', 'public')))

  router.get('/healthcheck', function * () {
    this.body = {
      name: pkg.name,
      version: pkg.version,
      commit
    }
  })

  router.get('/services', function * () {
    this.body = availableServices
  })

  app.use(router.routes())

  return app
}
