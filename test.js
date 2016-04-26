const app = require('koa')()


app.use(function * () {
  this.body = 'consul'
})

app.listen(3000)
