'use strict'

const path = require('path')
const fs = require('fs')

const pkg = require('../package.json')
const versionPath = path.join(__dirname, '..', 'VERSION')
const commit = fs.existsSync(versionPath) ? fs.readFileSync(versionPath, 'utf8').trim() : null


module.exports = (proxies) => {
  const app = require('koa')()
  const router = require('koa-router')()
  const services = proxies.reduce((services, service) => {
    services[service.name] = Object.assign({
      addresses: []
    }, service)

    return services
  }, {})

  app.use(require('koa-static')(path.join(__dirname, '..', 'public')))

  router.get('/healthcheck', function * () {
    this.body = {
      name: pkg.name,
      version: pkg.version,
      commit,
      services: services
    }
  })

  app.use(router.routes())

  app.setService = (service, addresses) => {
    services[service].addresses = addresses
  }

  return app
}
