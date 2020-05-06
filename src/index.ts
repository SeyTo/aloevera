import app from './app'

const port = app.get('port') || '3030'
const server = app.listen(port)

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection at ', p, reason);
})

server.on('listening', () => {
  console.log('')
  console.log('==================================')
  console.log('Node listening on %s:%d', app.get('host'), port)
  console.log('==================================')
})
