const Mustache = require('mustache')
const debug = require('debug')('proxy:server')
const exec = require('child_process').execSync
const fs = require('fs')
const yaml = require('js-yaml')

// const consul = require('./src/consul')({
//   CONSUL_HOST: process.env.CONSUL_HOST || '127.0.0.1',
//   CONSUL_PORT: process.env.CONSUL_PORT || '8500',
//   PROXIES_KEY: process.env.PROXIES_KEY || 'proxies'
// })


/**
* proxyConf structure
[
  {
    name => service name
    ingress_host => incoming host
    egress_host => proxied host
    port => service port
  }
]
*/
const services = process.env.SERVICES.split(';').map(conf => {
  conf = conf.split(':')
  return {
    name: conf[0],
    ingress_host: conf[1],
    egress_host: conf[2],
    port: conf[3],
  }
})
debug('configured services', services)

const healthcheck = require('./src/healthcheck')(services)
healthcheck.listen(3000)

const template = fs.readFileSync(process.env.NGINX_TMPL_PATH || __dirname + '/nginx.conf.mu', 'utf8')

const conf = Mustache.render(template, {
  services,
  listen: 8080
})
debug('nginx configuration', "START >>>\n\n" + conf + "\n\nEND <<<")
fs.writeFileSync('/etc/nginx/nginx.conf', conf)

const reload = require('./src/nginx')()

const dns = require('./src/dns')(services.map(service => service.egress_host))
dns.on('change', (service, addresses) => {
  debug(service, 'addresses has changed', addresses)
  healthcheck.setService(service, addresses)
  reload()
})
