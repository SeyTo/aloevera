import path = require('path')
import express = require('express')
import favicon = require('serve-favicon')
import compress = require('compression') 
import helmet = require('helmet')
import cors = require('cors')
import morgan = require('morgan')
import bodyParser = require('body-parser')

import configuration from './aloevera/configuration'
import mongoose from './aloevera/mongoose'
import AloeVera from './aloevera/aloevera'
import services from './services'

const app = AloeVera()

app.configure(configuration())
app.use(compress())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
app.use(compress())
app.use(helmet())
app.use(cors())
if (process.env.NODE_ENV === 'development') app.use(morgan('common'))

app.configure(mongoose())
app.configure(services)

// host public folder
app.use('/', express.static(app.get('public')))
// TODO: apply base url if possible <19-04-20, yourname> //

// define error handlers at last
// app.use(errorLogger())
// app.use(errorHandler())

export default app
