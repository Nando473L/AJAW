const admin = require('firebase-admin');
const serviceAccount = require('../.vscode/ajaw-7d954-firebase-adminsdk-sx8cm-ec78987eb8.json');

// Inicializar la app de Firebase con las credenciales
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtener referencia a Firestore
const db = admin.firestore();

// Exportar la referencia a la base de datos
module.exports = db;
