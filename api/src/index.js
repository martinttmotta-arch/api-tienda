const express = require('express')
require('./db')

const app = express()
app.use(express.json())

const productosRouter = require('./routes/productos')
app.use('/api/productos', productosRouter)

const authRouter = require('./routes/auth.js')
app.use('/api/auth', authRouter)

app.listen(3000, () => console.log('Servidor en puerto 3000'))