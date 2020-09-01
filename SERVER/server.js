const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');
const sqlite = require('sqlite3');
const util = require('util');
const { json } = require('body-parser');
var info_plato;
const db = new sqlite.Database('./delila.sqlite', (err) => console.log(err));
var is_admin = 0;
var id_usuario = 5,
    id_pedido = 10,
    id_carrito = 20,
    id_plato = 51;
var usuario_activo = 0; 
var usuario_user;
const not_admin=0;
const api = express();
api.use(bodyParser.json());

function inicializarDB() {

    db.serialize(function() {
        db.run("DROP TABLE IF EXISTS usuarios");
        db.run("DROP TABLE IF EXISTS pedidos");
        db.run("DROP TABLE IF EXISTS platos");
        db.run("DROP TABLE IF EXISTS carritos");

        });
}
inicializarDB();

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(utils.estadoDeServer.statusErrorCredenciales).send(utils.mensajeServer.statusErrorCredencialesMensaje);
    }
}

api.listen(3000, (req, res) => {
    let fecha = new Date();
    console.log(fecha + ' : Servidor Delilah resto activo...');
});

api.post('/usuarios', (req, res) => {
    const { usuario, nombre_apellido, mail, telefono, domicilio, password } = req.body;
    
            db.all("INSERT INTO usuarios VALUES (?,?,?,?,?,?,?,?)", id_usuario, usuario, nombre_apellido, mail, telefono, domicilio, password, not_admin,(err,resultados)=>{
                id_usuario++;
                res.status(utils.estadoDeServer.statusOk);
                res.send(utils.mensajeServer.statusUsuarioNuevoOk);
                if(err){
                    console.log(err);
                    console.log(utils.estadoDeServer.statusErrorCliente);
                    res.status(utils.estadoDeServer.statusErrorServidor);
                    res.send(utils.mensajeServer.statusErrorServidorMensaje);
                }
            });
});

api.get('/usuarios', (req, res) => {
    if (usuario_activo && is_admin) {
        console.log("is admin");

        let unUsuario;
        console.log("Consulta de admin");
            db.all('SELECT usuario,nombre_apellido,mail,telefono,domicilio from usuarios', (err, resultados) => {
            console.log(resultados);
                res.status(utils.estadoDeServer.statusOk).send(resultados);
            });
    } else {
        console.log("not admin");
        if(usuario_activo){
            db.all('SELECT usuario,nombre_apellido,mail,telefono,domicilio from usuarios where id_usuario=?',usuario_activo, (err, resultados) => {
            console.log(resultados);
                res.status(utils.estadoDeServer.statusOk).send(resultados);
            });
        }
        else{
            console.log("ingreso de intruso "+utils.mensajeServer.statusNotFoundMensaje);
            res.status(utils.estadoDeServer.statusErrorCredenciales);
            res.send(utils.mensajeServer.statusPrevioLogueo);
        }
    }
});

api.post('/usuarios/login', (req, res) => {
  const { usuario, mail, password } = req.body;
  let unapass;
  console.log(usuario+mail+password);
    if (typeof mail === 'undefined') {
        db.serialize(function() {
            db.all('SELECT id_usuario,usuario,password,is_admin from usuarios where usuario=?', usuario, (err, resultados) => {
                unapass=JSON.stringify(resultados[0].password);
                if(JSON.parse(unapass)===password){
                    console.log(resultados);
                    console.log("ingreso exitoso");
                    usuario_activo=resultados[0].id_usuario;
                    usuario_user=resultados[0].usuario;
                    if(resultados[0].is_admin)
                    {
                        is_admin=1;
                        const token=jwt.sign({usuario_activo},utils.clavesecreta);
                        res.header('auth-token',token).send(token);
                        res.status(utils.estadoDeServer.statusOk);
                    }else{
                        res.status(utils.estadoDeServer.statusOk);
                        res.send(utils.mensajeServer.statusOkMensaje);
                        is_admin=0;
                    }
                   }else{
                    res.status(utils.estadoDeServer.statusErrorCliente);
                    res.send(utils.mensajeServer.statusErrorClienteMensaje);
                   }                  
            });   
        });    
    } else {     
        db.serialize(function() {
            db.all('SELECT id_usuario,usuario,password,is_admin FROM usuarios WHERE mail=?', mail, (err, resultados) => {
                if(resultados){
                    unapass=JSON.stringify(resultados[0].password);
                    if(JSON.parse(unapass)===password){
                        console.log("ingreso exitoso");
                        usuario_activo=resultados[0].id_usuario;
                        if(resultados[0].is_admin)
                    {
                        is_admin=1;
                        const token=jwt.sign({usuario_activo},utils.clavesecreta);
                        res.header('auth-token',token).send(token);
                        res.status(utils.estadoDeServer.statusOk);
                    }else{
                        res.status(utils.estadoDeServer.statusOk);
                        res.send(utils.mensajeServer.statusOkMensaje);
                        is_admin=0;
                    }
                       }else{
                        res.status(utils.estadoDeServer.statusErrorCliente);
                        res.send(utils.mensajeServer.statusErrorClienteMensaje);
                       }  
                  }else{
                    res.status(utils.estadoDeServer.statusErrorCliente);
                    res.send(utils.mensajeServer.statusErrorClienteMensaje);
                  }
            });
    });
}
});

api.get('/platos', (req, res) => {
        db.all('SELECT * from platos', (err, resultados) => {
            let unPlato;
            console.log(utils.mensajeServer.statusOkConsulta);   
            res.status(utils.estadoDeServer.statusOk).send(resultados);
        });
}); 

api.post('/pedidos', (req, res) => {
    //verificar que el usuario este activo--> se haya logueado
    const { t_pago, usuario, domicilio, total, carrito } = req.body;
    var fecha = new Date();
    if(usuario_activo){
        db.serialize(function() {
            db.all('INSERT INTO pedidos VALUES (?,?,?,?,?,?,?)', id_pedido, t_pago, utils.estadoPedidos.pedidoNuevo, fecha, total, usuario, id_carrito);
            db.all('INSERT INTO carritos VALUES (?,?,?,?)', id_carrito, id_pedido, carrito[0].id_plato, carrito[0].cantidad);
            id_carrito++;
            console.log(utils.mensajeServer.statusOkPedidoMensaje)
            res.status(utils.estadoDeServer.statusOk);
            res.send(utils.mensajeServer.statusOkPedidoMensaje);
        });
    }else{
        console.log(error);
        console.log(utils.estadoDeServer.statusErrorCliente);
        res.status(utils.estadoDeServer.statusErrorCredenciales).send(utils.mensajeServer.statusPrevioLogueo);
    }    

});
api.delete('/pedidos/:id_pedido', verifyToken, (req, res) => {
    let un_id_plato = req.params.id_pedido;
    if(is_admin){
        db.all('DELETE pedidos WHERE id_pedido=?',un_id_plato, (err, resultados) => {
            res.status(utils.estadoDeServer.statusOk);
            res.send(utils.mensajeServer.statusDeleteOk);
        });
    }else{
        res.status(utils.estadoDeServer.statusErrorCredenciales).send(utils.mensajeServer.statusErrorCredencialesMensaje);
    }  
});
api.get('/pedidos/',(req,res)=>{
    if(usuario_activo){
       if(is_admin){
        db.all('SELECT * from pedidos', (err, resultados) => {
            console.log(resultados);
                res.status(utils.estadoDeServer.statusOk).send(resultados);
            });
       }
       else{
            db.all('SELECT * from pedidos where usuario=?',usuario_user, (err, resultados) => {
            console.log(resultados);
                res.status(utils.estadoDeServer.statusOk).send(resultados);
            });
       }
    }else{
        res.status(utils.estadoDeServer.statusErrorCredenciales).send(utils.mensajeServer.statusErrorCredencialesMensaje);
    }  
})
api.post('/platos',verifyToken, (req, res) => {
    const { nombre_plato, precio, url_plato, stock } = req.body;
    if(is_admin){
        db.serialize(function() {
            db.run("INSERT INTO platos VALUES (?,?,?,?,?)", id_plato, nombre_plato, precio, stock, url_plato);
            id_plato++;
            res.status(utils.estadoDeServer.statusOk);
            res.send(utils.mensajeServer.statusOkConsulta);
        });
    }else{
        res.status(utils.estadoDeServer.statusErrorCredenciales).send(utils.mensajeServer.statusErrorCredencialesMensaje);
    }
});
api.get('/platos/:id_plato', (req, res) => {
    let un_id_plato = req.params.id_plato;
    let un_plato;
        db.all('SELECT * FROM platos WHERE id_plato=?',un_id_plato, (err, resultados) => {
            console.log(resultados);
            if(resultados){
                un_plato=JSON.stringify(resultados);
                res.status(utils.estadoDeServer.statusOk).send(JSON.parse(un_plato));
            }
            else{
                res.status(utils.estadoDeServer.statusErrorCliente).send(utils.mensajeServer.statusErrorClienteMensaje);
            }
        });
});

api.put('/platos/:id_plato/stock', verifyToken, (req, res) => {
    let un_id_plato = req.params.id_plato;
    const {stock}=req.body;
    if(is_admin){
        db.all('UPDATE platos SET stock=? WHERE id_plato=?',stock,un_id_plato, (err, resultados) => {
            //un_plato=JSON.stringify(resultados[0]);
            res.status(utils.estadoDeServer.statusOk);
            res.send(utils.mensajeServer.statusOkActualizacion);
        });
    }else{
        res.status(utils.estadoDeServer.statusErrorCliente).send(utils.mensajeServer.statusErrorClienteMensaje);
    }
       
});
api.delete('/platos/:id_plato', verifyToken, (req, res) => {
    let un_id_plato = req.params.id_plato;
    db.all('SELECT * FROM platos WHERE id_plato=?',un_id_plato, (err, resultados) => {
        if(resultados)
        {
            db.all('DELETE platos WHERE id_plato=?',un_id_plato, (err, resultados) => {
                res.status(utils.estadoDeServer.statusOk);
                res.send(utils.mensajeServer.statusOkActualizacion);
            });
        }
        else{
            res.status(utils.estadoDeServer.statusErrorCliente).send(utils.mensajeServer.statusErrorClienteMensaje);
        }
    }) 
});
api.put('/pedidos/:id_pedido/estado',verifyToken,(req,res)=>{
const {estado_pedido}=req.body;
let un_id_pedido = req.params.id_pedido;
if(is_admin){
    db.all('UPDATE pedidos SET estado_pedido=? WHERE id_pedido=?',estado_pedido,un_id_pedido, (err, resultados) => {
        res.status(utils.estadoDeServer.statusOk);
        res.send(utils.mensajeServer.statusOkActualizacion);
    });
}else{
    res.status(utils.estadoDeServer.statusErrorCliente).send(utils.mensajeServer.statusErrorClienteMensaje);
}

});

api.post('/db/init',(req,res)=>{
    const {unaquery}=req.body;
    db.serialize(function() {
        db.run(unaquery);
        console.log("ok");
        res.status(utils.estadoDeServer.statusOk).send(utils.mensajeServer.statusDBOK);
    })
})
api.get('/logout',(req,res)=>{
    usuario_activo=0;
    is_admin=0;
    res.status(utils.estadoDeServer.statusOk);
    res.send(utils.mensajeServer.statusLogoutMensaje);
})
function crearDB(){
    
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS usuarios ( id_usuario INT PRIMARY KEY NOT NULL, usuario VARCHAR (60) NOT NULL, nombre_apellido VARCHAR (60) NOT NULL, mail VARCHAR(60) NOT NULL, telefono VARCHAR(20) NOT NULL, domicilio VARCHAR (60) NOT NULL, password VARCHAR(20) NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE)");
        db.run("CREATE TABLE IF NOT EXISTS pedidos (id_pedido INT PRIMARY KEY NOT NULL,t_pago INT NOT NULL,estado_pedido INT NOT NULL,date DATETIME NOT NULL,total VARCHAR(20) NOT NULL,usuario VARCHAR (60) NOT NULL,id_carrito INT NOT NULL)");
        db.run("CREATE TABLE IF NOT EXISTS platos (id_plato INT PRIMARY KEY ,nombre_plato VARCHAR (60) NOT NULL,precio FLOAT NOT NULL,stock INT NOT NULL,url_plato VARCHAR(200) NOT NULL)");
        db.run("CREATE TABLE IF NOT EXISTS carritos (id_carrito INT PRIMARY KEY,id_pedido INT NOT NULL,id_plato INT NOT NULL,cantidad INT NOT NULL)");
        db.run("INSERT INTO usuarios VALUES (1,'admin','admin','admin@gmail.com','4343456','ESTADOS UNIDOS 444','1234',TRUE)");

        });
}
//crearDB();