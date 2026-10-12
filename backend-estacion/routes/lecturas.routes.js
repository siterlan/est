const express = require('express');
const router = express.Router();
const { crearLectura, obtenerUltimaLectura, obtenerUltimasLecturas, obtenerResumenActual } = require('../controllers/lecturas.controller');

router.post('/lecturas', crearLectura);
router.get('/lecturas/ultima', obtenerUltimaLectura);
router.get('/lecturas/ultimas', obtenerUltimasLecturas);
router.get('/lecturas/resumen-actual', obtenerResumenActual);

module.exports = router;