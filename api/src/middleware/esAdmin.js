module.exports = (req, res, next) => {
    console.log('Usuario:', req.usuario)
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado - solo administradores' })
    }
    next()
}