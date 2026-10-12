const { sql } = require('../config/db');

const crearLectura = async (req, res) => {
  try {
    const { nodoId, sensorId, valor, bateria, latitud, longitud, fechaHora } = req.body;

    if (!nodoId || !sensorId || valor === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: 'nodoId, sensorId y valor son obligatorios'
      });
    }

    const pool = await sql.connect();

    await pool.request()
      .input('NodoId', sql.Int, nodoId)
      .input('SensorId', sql.Int, sensorId)
      .input('Valor', sql.Decimal(12, 4), valor)
      .input('Bateria', sql.Decimal(5, 2), bateria ?? null)
      .input('Latitud', sql.Decimal(10, 6), latitud ?? null)
      .input('Longitud', sql.Decimal(10, 6), longitud ?? null)
      .input('FechaHora', sql.DateTime, fechaHora ? new Date(fechaHora) : new Date())
      .query(`
        INSERT INTO Lecturas (NodoId, SensorId, Valor, Bateria, Latitud, Longitud, FechaHora)
        VALUES (@NodoId, @SensorId, @Valor, @Bateria, @Latitud, @Longitud, @FechaHora)
      `);

    res.status(201).json({
      ok: true,
      mensaje: 'Lectura guardada correctamente'
    });

  } catch (error) {
    console.error('Error al guardar lectura:', error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al guardar lectura',
      error: error.message
    });
  }
};

const obtenerUltimaLectura = async (req, res) => {
  try {
    const pool = await sql.connect();

    const result = await pool.request().query(`
      SELECT TOP 1
        l.Id,
        l.NodoId,
        n.Nombre AS NodoNombre,
        l.SensorId,
        s.Nombre AS SensorNombre,
        s.Tipo AS SensorTipo,
        s.Unidad,
        l.Valor,
        l.Bateria,
        l.Latitud,
        l.Longitud,
        l.FechaHora,
        l.CreatedAt
      FROM Lecturas l
      INNER JOIN Nodos n ON l.NodoId = n.Id
      INNER JOIN Sensores s ON l.SensorId = s.Id
      ORDER BY l.Id DESC
    `);

    res.status(200).json({
      ok: true,
      data: result.recordset[0] || null
    });

  } catch (error) {
    console.error('Error al obtener ultima lectura:', error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener ultima lectura',
      error: error.message
    });
  }
};

const obtenerUltimasLecturas = async (req, res) => {
  try {
    const pool = await sql.connect();

    const result = await pool.request().query(`
      SELECT TOP 20
        l.Id,
        l.NodoId,
        n.Nombre AS NodoNombre,
        l.SensorId,
        s.Nombre AS SensorNombre,
        s.Tipo AS SensorTipo,
        s.Unidad,
        l.Valor,
        l.Bateria,
        l.Latitud,
        l.Longitud,
        l.FechaHora,
        l.CreatedAt
      FROM Lecturas l
      INNER JOIN Nodos n ON l.NodoId = n.Id
      INNER JOIN Sensores s ON l.SensorId = s.Id
      ORDER BY l.Id DESC
    `);

    res.status(200).json({
      ok: true,
      total: result.recordset.length,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error al obtener ultimas lecturas:', error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener ultimas lecturas',
      error: error.message
    });
  }
};
const obtenerResumenActual = async (req, res) => {
  try {
    const pool = await sql.connect();

    const result = await pool.request().query(`
      WITH UltimoBloque AS (
        SELECT TOP 1 NodoId, FechaHora
        FROM Lecturas
        ORDER BY FechaHora DESC, Id DESC
      )
      SELECT
        l.Id,
        l.NodoId,
        n.Nombre AS NodoNombre,
        l.SensorId,
        s.Nombre AS SensorNombre,
        s.Tipo AS SensorTipo,
        s.Unidad,
        l.Valor,
        l.Bateria,
        l.Latitud,
        l.Longitud,
        l.FechaHora,
        l.CreatedAt
      FROM Lecturas l
      INNER JOIN Nodos n ON l.NodoId = n.Id
      INNER JOIN Sensores s ON l.SensorId = s.Id
      INNER JOIN UltimoBloque u
        ON l.NodoId = u.NodoId
       AND l.FechaHora = u.FechaHora
      ORDER BY l.SensorId ASC
    `);

    res.status(200).json({
      ok: true,
      total: result.recordset.length,
      data: result.recordset
    });

  } catch (error) {
    console.error('Error al obtener resumen actual:', error.message);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener resumen actual',
      error: error.message
    });
  }
};
module.exports = {
  crearLectura,
  obtenerUltimaLectura,
  obtenerUltimasLecturas,
  obtenerResumenActual
};