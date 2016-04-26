const Mustache = require('mustache')
const debug = require('debug')('proxy:server')
const exec = require('child_process').execSync
const fs = require('fs')
const yaml = require('js-yaml')

const template = fs.readFileSync(process.env.NGINX_TMPL_PATH || __dirname + '/nginx.conf.mu', 'utf8')
const updateNginxConf = (services) => {
  const conf = Mustache.render(template, {services})
  fs.writeFileSync('/etc/nginx/nginx.conf', conf)
}

const proxies = yaml.safeLoad(fs.readFileSync(process.env.PROXY_CONFIG_PATH || __dirname + '/proxies.yml', 'utf8'))
const consul = require('./src/consul')({
  CONSUL_HOST: process.env.CONSUL_HOST || '127.0.0.1',
  CONSUL_PORT: process.env.CONSUL_PORT || '8500',
  PROXIES: proxies
})


require('./src/healthcheck')(consul).listen(3000)
updateNginxConf()
require('./src/nginx')()

consul.on('change', (services) => {
  debug('services has changed', services)
  updateNginxConf(services)
  exec("nginx -s reload")
  debug('ningx.conf updated')
})
