const express = require('express')
const router = express.Router()
const pool = require('../db.js')
const authMiddleware = require('../middleware/auth')
const esAdmin = require('../middleware/esAdmin')

//GET de todos los productos
router.get('/', async, authMiddleware, esAdmin, (req, res) =>{
    try{
        const result = await pool.query('SELECT * FROM  productos')
        res.json(result.rows)
    } catch (err){
        res.status(500).json({ error: err.message})
    }
})

//POST crear productos
router.post('/', authMiddleware,, esAdmin, async (req, res) => {
    const {nombre, precio, stock } = req.body
    try{
        const result = await pool.query(
          'INSERT INTO productos (nombre, precio, stock) VALUES ( $1, $2, $3) RETURNING *', [nombre, precio, stock]
        )
        res.status(201).json(result.rows[0])
    } catch (err){
         res.status(500).json({ error: err.message})
    }
})

//PUT actualizar productos 
router.put('/:id', authMiddleware, esAdmin, async (req, res) =>{
    const { id } = req.params
    const { nombre, precio, stock} = req.body
    try{
        const result = await pool.query(
          'UPDATE productos SET nombre=$1, precio=$2, stock=$3 WHERE id=$4 RETURNING *',[nombre, precio, stock, id]
        )
        if(result.rows.length === 0) return res.status(404).json({error: 'Producto no encontrado'})
        res.json(result.rows[0])
    } catch (err){
        res.status(500).json({ error: err.message})
    }
})

//DELETE eliminar productos
router.delete('/:id', authMiddleware, esAdmin,  async (req, res) =>{
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM productos WHERE id=$1 RETURNING*', [id])
        if(result.rows.length === 0) return res.status(404).json({error: 'Producto no encontrado'})
        res.json({ mensaje: 'Producto eliminado', producto: result.rows[0]})
    } catch (err){
        res.status(500).json({error: err.message})
    }
})


module.exports = router