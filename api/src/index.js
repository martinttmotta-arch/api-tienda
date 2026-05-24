const express = require('express')
const ordenesRouter = require('./routes/ordenes')
require('./db')

const app = express()
app.use(express.json())

const productosRouter = require('./routes/productos')
app.use('/api/productos', productosRouter)

const authRouter = require('./routes/auth.js')
app.use('/api/auth', authRouter)

const ordenesRouter = require('./routes/ordenes.js')
app.use('/api/ordenes', ordenesRouter)

app.listen(3000, () => console.log('Servidor en puerto 3000'))