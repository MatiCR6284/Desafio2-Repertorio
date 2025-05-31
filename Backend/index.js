import express from 'express'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express()
app.use(cors())

const PORT = process.env.PORT ?? 5002
console.log(process.env.PORT)

app.get('/', (req, res) => {
  const filePath = path.resolve('public/index.html')
  res.sendFile(filePath)
})

app.use(express.json())
app.use(express.static('public'))

const CANCIONES_PATH = path.join(__dirname, 'canciones.json');

function leerCanciones () {
  try {
    const data = fs.readFileSync(CANCIONES_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function guardarCanciones (canciones) {
  try {
    console.log("Guardando canciones:", canciones);
    fs.writeFileSync(CANCIONES_PATH, JSON.stringify(canciones, null, 2));
  } catch (e) {
    console.log("Error guardando canciones:", e.message, e.stack);
    throw e;
  }
}

// GET
app.get('/canciones', (req, res) => {
  const canciones = leerCanciones()
  res.json(canciones)
})

// POST
app.post('/canciones', (req, res) => {
  try {
    console.log("Datos recibidos en POST:", req.body);
    const canciones = leerCanciones();
    const nuevaCancion = {
      id: req.body.id || Date.now(),
      titulo: req.body.titulo,
      artista: req.body.artista,
      tono: req.body.tono
    };
    canciones.push(nuevaCancion);
    guardarCanciones(canciones);
    res.status(201).json(nuevaCancion);
  } catch (e) {
    console.log("Error en POST /canciones:", e.message, e.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// PUT
app.put('/canciones/:id', (req, res) => {
  const id = Number(req.params.id)
  const canciones = leerCanciones()
  const index = canciones.findIndex(c => c.id === id)
  if (index !== -1) {
    canciones[index] = {
      id,
      titulo: req.body.titulo,
      artista: req.body.artista,
      tono: req.body.tono
    }
    guardarCanciones(canciones)
    res.sendStatus(200)
  } else {
    res.status(404).json({ error: 'Canción no encontrada' })
  }
})

// DELETE
app.delete('/canciones/:id', (req, res) => {
  const id = Number(req.params.id)
  const canciones = leerCanciones()
  const nuevasCanciones = canciones.filter(c => c.id !== id)
  if (nuevasCanciones.length === canciones.length) {
    return res.status(404).json({ error: 'Canción no encontrada' })
  }
  guardarCanciones(nuevasCanciones)
  res.sendStatus(200)
})

app.listen(PORT, console.log(`Server: http://localhost:${PORT}`))
