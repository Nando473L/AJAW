const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

// Cargar variables de entorno
dotenv.config({ path: "./env/.env" });

// Inicializar Firebase
const serviceAccount = require('./ajaw-7d954-firebase-adminsdk-sx8cm-ec78987eb8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-database-name.firebaseio.com'
});

const db = admin.firestore();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configura las carpetas `public` y `assets` para servir archivos estáticos
app.use(express.static(path.join(__dirname, "")));

// Configura el middleware para sesiones
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Middleware para proteger rutas de acceso
const authMiddleware = (req, res, next) => {
  if (!req.session.loggedin) {
    res.redirect("/login");
  } else {
    next();
  }
};

// Rutas para archivos HTML estáticos
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Página de inicio
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html")); // Página de login
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html")); // Página de registro
});

app.get("/cliente", authMiddleware, (req, res) => {
  if (req.session.isCliente) {
    res.sendFile(path.join(__dirname, "cliente.html")); // Página del cliente
  } else {
    res.redirect("/login");
  }
});

app.get("/admin", authMiddleware, (req, res) => {
  if (req.session.isAdmin) {
    res.sendFile(path.join(__dirname, "admin.html")); // Página del admin
  } else {
    res.redirect("/login");
  }
});

// Ruta para el registro
app.post("/register", async (req, res) => {
  const { username, name, role, password } = req.body;

  try {
    // Hashear la contraseña
    let passwordHash = await bcrypt.hash(password, 8);

    // Guardar el nuevo usuario en Firestore
    await db.collection('users').doc(username).set({
      username: username,
      name: name,
      role: role,
      password: passwordHash
    });

    // Redirigir al usuario a la página de login después de un registro exitoso
    res.redirect("/login");

  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.send("Error en el registro");
  }
});

// Ruta para el login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    try {
      const userDoc = await db.collection('users').doc(username).get();
      if (!userDoc.exists) {
        res.send("Usuario y/o contraseña incorrectos");
      } else {
        const userData = userDoc.data();
        if (!(await bcrypt.compare(password, userData.password))) {
          res.send("Usuario y/o contraseña incorrectos");
        } else {
          req.session.loggedin = true;
          req.session.name = userData.name;
          req.session.isAdmin = userData.role === "admin";
          req.session.isCliente = userData.role === "cliente";

          if (req.session.isAdmin) {
            res.redirect("/admin");
          } else if (req.session.isCliente) {
            res.redirect("/cliente");
          }
        }
      }
    } catch (error) {
      console.error('Error al autenticar el usuario:', error);
      res.send("Error en el login");
    }
  } else {
    res.send("Por favor ingresa usuario y contraseña");
  }
});

// Ruta para cerrar sesión
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Puerto de escucha
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SERVER RUNNING IN http://localhost:${port}`);
});
