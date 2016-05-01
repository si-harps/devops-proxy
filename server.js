const Mustache = require('mustache')
const debug = require('debug')('proxy:server')
const exec = require('child_process').execSync
const fs = require('fs')
const yaml = require('js-yaml')

// const template = fs.readFileSync(process.env.NGINX_TMPL_PATH || __dirname + '/nginx.conf.mu', 'utf8')
//
// const updateNginxConf = (services) => {
//   const conf = Mustache.render(template, {services})
//   fs.writeFileSync('/etc/nginx/nginx.conf', conf)
// }

// const consul = require('./src/consul')({
//   CONSUL_HOST: process.env.CONSUL_HOST || '127.0.0.1',
//   CONSUL_PORT: process.env.CONSUL_PORT || '8500',
//   PROXIES_KEY: process.env.PROXIES_KEY || 'proxies'
// })


const healthcheck = require('./src/healthcheck')()
healthcheck.listen(3000)

// const nginx = require('./src/nginx')()
// nginx.start(8080)
//
const dns = require('./src/dns')(process.env.DOMAINS.split(','))
dns.on('change', (service, addresses) => {
  debug(service, 'addresses has changed', addresses)
  healthcheck.setService(service, addresses)
  // nginx.reload()
})
