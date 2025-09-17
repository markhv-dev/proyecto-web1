// Conexión a la base de datos
const config = require('./config.json');

function connect() {
    console.log(`Conectando a DB en ${config.host}:${config.port}`);
}

module.exports = { connect };
