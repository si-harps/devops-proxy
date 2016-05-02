const debug = require('debug')('proxy:server')
const Mustache = require('mustache')
const fs = require('fs')

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

// @todo should update nginx conf when address changes as well
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
