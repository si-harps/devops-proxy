const Promise = require('bluebird')
const all = Promise.all
const path = require('path')
const debug = require('debug')('proxy:consul')
const EventEmitter = require('events');
const util = require('util');

function ConsulEmitter() {
  EventEmitter.call(this);
}
util.inherits(ConsulEmitter, EventEmitter);

const getInstances = (consul, name) => {
  return consul.health.service(name)
    .spread(ins => ins)
    .then(ins => ins.filter(i => !!i.Service.Address))
    .then(ins => ins.map(i => i.Service))
    .then(instances => ({name, instances}))
}

module.exports = (config) => {
  const events = new ConsulEmitter()
  const consul = require('consul')({
    host: config.CONSUL_HOST,
    port: config.CONSUL_PORT,
    promisify (fn) {
      return new Promise((resolve, reject) => {
        try {
          fn((err, data, res) => {
            if (err) {
              err.res = res
              return reject(err)
            }
            resolve([data, res])
          })
        } catch (err) {
          reject(err)
        }
      })
    }
  })

  const proxies = config.PROXIES
  const watch = consul.watch({
    method: consul.catalog.service.list
  })

  watch.on('change', (services, res) => {
    all(Object.keys(services).map(name => getInstances(consul, name)))
    .then(services =>
      services.map(service =>
        Object.assign({}, service, {proxy: proxies[service.name]})))
    .filter(service => !!service.proxy && service.instances.length)
    .then(services => events.emit('change', services))
  })

  watch.on('error', (err) => {
    debug('error', err)
  })

  debug('listing for changes in consul services ...')
  return events
}
