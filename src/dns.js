'use strict'

const EventEmitter = require('events');
const debug = require('debug')('proxy:dns')
const dns = require('dns')
const promisify = require('bluebird').promisify
const all = require('bluebird').all
const resolve = promisify(dns.resolve4)
const reverse = promisify(dns.reverse)
const deepEqual = require('assert').deepEqual

module.exports = (hosts) => {
  hosts = Array.isArray(hosts) ? hosts : [hosts]

  return hosts.map(host => {
    const emitter = new EventEmitter()
    let ips = []
    const getServices = () => {
      resolve(host)
        .then(addresses => {
          addresses.sort()
          debug(host, 'addresses', addresses)
          try {
            deepEqual(ips, addresses)
          } catch (err) {
            debug(host, 'service addresses has changed')
            ips = addresses
            emitter.emit('change', host, ips)
          }
        })
        .catch(err => debug(host, 'ERROR', err, err.stack))
        .finally(() => setTimeout(getServices, 5000))
    }

    getServices()

    return emitter
  })
    .reduce((emitter, service) => {
      service.on('change', (service, ips) => {
        emitter.emit('change', service, ips)
      })

      return emitter
    }, new EventEmitter())
}
