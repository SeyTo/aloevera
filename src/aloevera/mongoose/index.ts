import mongoose = require('mongoose')
import debug from 'debug'
const d = debug('mongoose')

export default function () {
  return (app: AloeVera) => {
    mongoose.connect(
      app.get('db').uri, 
      app.get('db').options,
    ).then(() => {
      d('connected', { tag: 'db' })
    })

    mongoose.Promise = global.Promise

    app.set('mongooseClient', mongoose)
  };
}
