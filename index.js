//IMPORTACIÓN DE MÓDULOS
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

//obtener directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//ruta de archivo json para almacenar los datos
const dataFile = path.join(__dirname, 'deportes.json');

const app = express();
const port = 3000;

//LEVANTAR SERVIDOR
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

//MIDDLEWARES:
//para dejar carpeta pública 
app.use(express.static('public'));
//para parsear json en las solicitudes
app.use(express.json());

//ENDPOINTS:
//RUTA PARA LA PÁGINA PRINCIPAL
app.get(['/', '/home', '/inicio'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

//RUTA PARA OBTENER TODOS LOS DATOS
app.get('/deportes', async (req, res) => {
    try {
        //leer deportes.json
        const data = await fs.readFile(dataFile, 'utf8');
        //enviar los datos json
        res.json(JSON.parse(data));
    } catch (error) {
        console.log(error);
    }
});

//RUTA PARA AGREGAR UN DEPORTE
app.get('/agregar', async (req, res) => {
    try {
        //extraer datos (nombre, precio) de lso query usando destructuración
        const { nombre, precio } = req.query;
        //leer deportes.json
        const data = await fs.readFile(dataFile, 'utf8');
        //enviar los datos json
        const deportes = JSON.parse(data);
        //agregar con push el nuevo deporte al array
        deportes.deportes.push({ nombre, precio });
        //escribir los datos en deportes.json con 2 espacios
        await fs.writeFile(dataFile, JSON.stringify(deportes, null, 2))
        res.status(200).send('Deporte agregado con éxito');

    } catch (error) {
        res.status(500).send('Error al agregar el deporte');
    }
});

//RUTA PARA EDITAR UN DEPORTE EXISTENTE
app.get('/editar', async (req, res) => {
    try {
        //leer y extraer nombre y precio de deportes.json
        const { nombre, precio } = req.query;
        const data = await fs.readFile(dataFile, 'utf8');
        const deportes = JSON.parse(data);
        //buscar índice de deporte con findIndex
        const index = deportes.deportes.findIndex(item => item.nombre === nombre);
        //validación si existe indice en array
        if (index !== -1) {
            //si se encuentra, actualizar el precio
            deportes.deportes[index].precio = precio;
            //escribir los datos actuales en deportes.json
            await fs.writeFile(dataFile, JSON.stringify(deportes, null, 2));
            res.status(200).send('Deporte editado con éxito');
        } else {
            res.status(404).send('Deporte no encontrado');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al editar el deporte');
    }
});

//RUTA PARA ELIMINAR UN DEPORTE
app.get('/eliminar', async (req, res) => {
    try {
        const { nombre } = req.query;
        //leer los datos existentes
        const data = await fs.readFile(dataFile, 'utf8');
        const deportes = JSON.parse(data);
        //buscar índice de deporte con findIndex
        const index = deportes.deportes.findIndex(item => item.nombre === nombre);
        //validación si existe indice en array
        if (index !== -1) {
            //si se encuentra, eliminar el deporte del array
            deportes.deportes.splice(index, 1);
            //escribir los datos actuales en deportes.json
            await fs.writeFile(dataFile, JSON.stringify(deportes, null, 2));
            //respuesta del servidor
            res.status(200).send('Deporte eliminado con éxito');
        } else {
            res.status(404).send('Deporte no encontrado');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al eliminar el deporte');
    }
});

//RUTA DEFAULT PARA RUTAS NO DEFINIDAS
app.get('*', (req, res) => {
    res.send('Esta página no existe');
});
