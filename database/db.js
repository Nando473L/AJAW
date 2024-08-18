const mysql = require('mysql');
const dotenv = require('dotenv');

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Creamos la conexión utilizando los valores de las variables de entorno para la configuración
const connection = mysql.createConnection({
  host: process.env.DB_HOST,     // Dirección del servidor de la base de datos
  user: process.env.DB_USER,     // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario de la base de datos
  database: process.env.DB_DATABASE // Nombre de la base de datos a la que queremos conectarnos
});

// Establecemos la conexión con la base de datos
connection.connect((error) => {
  if (error) {
    // En caso de error al conectar, se imprime un mensaje de error
    console.error('El error de conexión es:', error);
    return;
  }
  // Si la conexión se establece correctamente, se imprime un mensaje de éxito
  console.log('¡Conectado a la Base de Datos!');
});

console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // Asegúrate de imprimir la contraseña correcta

// Exportamos la conexión para que pueda ser utilizada en otros archivos
module.exports = connection;
