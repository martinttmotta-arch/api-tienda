const express = require('express');
const router = express.Router();
const pool = require('../db.js');
const authMiddleware = require('../middleware/auth');

//POST crear orden
router.post('/', authMiddleware, async (req, res) => {
    const { items } = req.body
    //items = [{ producto_id: 1, cantidad: 2}, { producto_id: 2, cantidad: 1}]
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
     
        let total = 0
        const itemsConPrecio = []

        for(const item of items){
            const result = await client.query('SELECT * FROM productos WHERE id=$1', [item.producto_id])
            if(result.rows.length === 0) throw new Error(`Producto con id ${item.producto_id} no encontrado`)
            const producto = result.rows[0]
            const subtotal = producto.precio * item.cantidad
            total += subtotal
            itemsConPrecio.push({ ...item, precio_unitario: producto.precio })
        }
        
        const orden = await client.query(
            'INSERT INTO ordenes (usuario_id, total) VALUES ($1, $2) RETURNING *', [req.usuario.id, total]
        )

        for(const item of itemsConPrecio){
            await client.query(
                'INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [orden.rows[0].id, item.producto_id, item.cantidad, item.precio_unitario]
            )
        }

        await client.query('COMMIT')
        res.status(201).json(orden.rows[0])
    } catch (err){
        await client.query('ROLLBACK')
        res.status(500).json({ error: err.message})
    }finally {
        client.release()
    }
})
//Get ordenes del usuario
router.get('/', authMiddleware, async (req, res) =>{
    try{
        const result = await pool.query(
            'SELECT * FROM ordenes WHERE usuario_id=$1 ORDER BY created_at DESC', [req.usuario.id]
        )
        res.json(result.rows)
    } catch (err){
        res.status(500).json({ error: err.message})
    }

})

module.expoert = router