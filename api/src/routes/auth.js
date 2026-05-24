const express = require('express')
const router = express.Router()
const pool = require('../db.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//POST registro 
router.post('/register', async (req, res) => {
    const { email, password } = req.body
    try{
        const hash = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id, email' , [email, hash]
        )
        res.status(201).json(result.rows[0])
    } catch (err){
        res.status(500).json({ error: err.message})
    }
})

//POST login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try{
        const result = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email])
        if(result.rows.length === 0) return res.status(401).json({ error: 'Usuarios no econtrado' })

        const usuario = result.rows[0]
        const valido = await bcrypt.compare(password, usuario.password)
        if (!valido) return res.status(401).json({ error: 'Constrasena incorrecta'})
        
        const token = jwt.sign({ id: usuario.id, email: usuario.email , rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '24h'})
        res.json({token})
    }catch (err){
        res.status(500).json({ error: err.message})
    }
})

module.exports = router