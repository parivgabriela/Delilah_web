const clavesecreta='delilah';
const statusOk = 200,
    statusOkValidacion=201,
    statusOkPedido=203,
    statusErrorCliente = 400,//bad request ingreso datos invalidos
    statusErrorCredenciales=401,//Unauthorized
    statusNotFound=404,
    statusErrorServidor=500;//Internal Server Error
    const statusOkMensaje = 'Ingreso exitoso',
    statusOkValidacionMensaje="Usuario verificado",
    statusOkPedidoMensaje="Pedido ingresado exitosamente",
    statusOkConsulta="Su consulta fue realizada exitosamente",
    statusDBOK="Query ejecutada correctamente",
    statusUsuarioNuevoOk="El usuario fue creado correctamente",
    statusOkActualizacion="La actualización fue realizada exitosamente",
    statusLogoutMensaje="Cerro sesión",
    statusErrorClienteMensaje ='Datos incorrectos',//bad request
    statusPrevioLogueo="Debe haber iniciado sesión previamente",
    statusDeleteOk="Se elimino correctamente",
    statusErrorCredencialesMensaje='Credencial inválida, no puede ingresar',//Unauthorized
    statusNotFoundMensaje='status not found',
    statusErrorServidorMensaje='Internal Server Error',//Internal Server Error
    statusCargadoCarritoMensaje="Se cargo en el carrito";
//def estados de los pedidos
const pedidoNuevo="Neuvo",pedidoConfirmado="Confirmadp",pedidoPreparado="Preparado",pedidoEnviado="Enviado",pedidoCancelado="Cancelado",
pedidoEntregado="Entregado";

const estadoPedidos={
    pedidoNuevo,pedidoConfirmado,pedidoPreparado,pedidoEnviado,pedidoCancelado,pedidoEntregado
}
const estadoDeServer={ 
    statusOk, statusOkValidacion ,
    statusOkPedido,
     statusErrorCliente, 
     statusErrorCredenciales, statusNotFound, statusErrorServidor}
    const mensajeServer={
        statusOkMensaje,
        statusOkValidacionMensaje,
        statusOkPedidoMensaje,
        statusOkConsulta,
        statusDBOK,
        statusUsuarioNuevoOk,
        statusOkActualizacion,
        statusLogoutMensaje,
        statusErrorClienteMensaje,
        statusPrevioLogueo,
        statusDeleteOk,
        statusErrorCredencialesMensaje,
        statusNotFoundMensaje, 
        statusErrorServidorMensaje,
        statusCargadoCarritoMensaje
    };

const efectivo=1,debito=2,credito=3;
const tPagos={efectivo,debito,credito};
//prueba para ejecutar la consola
let usuarios = [{
    usuario: "lolopari",
    nombre_ape: "lolo pari",
    mail: "lolo@gmail.com",
    telefono: "12344555",
    domicilio: "estados unidos",
    psw: "lolo",
    rol: true
},
{
    usuario: "charlotte",
    nombre_ape: "charlotte pari",
    mail: "charlotte@gmail.com",
    telefono: "123441",
    domicilio: "francia",
    psw: "charlotte",
    rol: false
}
];
let pedidos=[{
    
}]
//utils.mensajeServer.
//utils.estadoPedidos.
//utils.estadoDeServer
module.exports = { estadoDeServer,estadoPedidos,mensajeServer,tPagos,clavesecreta};