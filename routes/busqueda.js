import express from 'express';
import Hospital from '../models/hospital';
import Medico from '../models/medico';
import Usuario from '../models/usuario';

const app = express();

// =====================================================
// Busqueda por colección
// =====================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');
    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, médicos y hospitales',
                error: {message: 'Tipo de tabla/colección no válido'}
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });

    // Promise.all([
    //     buscarHospitales(regex),
    //     buscarMedicos(regex),
    //     buscarUsuarios(regex)
    // ]).then(respuesta => {
    //     if (tabla === 'hospital') {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales: respuesta[0]
    //         });
    //     }
    //
    //     if (tabla === 'medico') {
    //         res.status(200).json({
    //             ok: true,
    //             medicos: respuesta[1]
    //         });
    //     }
    //
    //     if (tabla === 'usuario') {
    //         res.status(200).json({
    //             ok: true,
    //             usuarios: respuesta[2]
    //         });
    //     }
    // });

});

// =====================================================
// Busqueda General
// =====================================================
app.get('/todo/:busqueda', (req, res, next) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i'); // expresión regular (Regular Expression)

    // Procesos asíncronos ejecutandose a la misma vez
    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales ', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {
        Medico.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{'nombre:': regex}, {'email': regex}])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios ', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

export default app;
