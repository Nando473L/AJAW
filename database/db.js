const db = require('./firebase'); // Importar la referencia de Firestore

// Crear o actualizar un documento en una colección
const addUser = async () => {
  try {
    const docRef = db.collection('users').doc('user-id');
    await docRef.set({
      name: 'John Doe',
      email: 'john.doe@example.com'
    });
    console.log('Documento escrito con ID: user-id');
  } catch (error) {
    console.error('Error añadiendo el documento: ', error);
  }
};

// Leer un documento de una colección
const getUser = async () => {
  try {
    const docRef = db.collection('users').doc('user-id');
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('Datos del documento:', doc.data());
    } else {
      console.log('No se encontró el documento!');
    }
  } catch (error) {
    console.error('Error obteniendo el documento: ', error);
  }
};

addUser();
getUser();
