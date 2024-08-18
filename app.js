const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config({ path: "./env/.env" });

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

const connection = require("./database/db");

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
  let passwordHash = await bcrypt.hash(password, 8);
  connection.query(
    "INSERT INTO users SET ?",
    { username, name, role, password: passwordHash },
    (error, results) => {
      if (error) {
        console.log(error);
        res.send("Error en el registro");
      } else {
        res.redirect("/login");
      }
    }
  );
});

// Ruta para el login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (error, results, fields) => {
        if (
          results.length == 0 ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          res.send("Usuario y/o contraseña incorrectos");
        } else {
          req.session.loggedin = true;
          req.session.name = results[0].name;
          req.session.isAdmin = results[0].role === "admin";
          req.session.isCliente = results[0].role === "cliente";

          if (req.session.isAdmin) {
            res.redirect("/admin");
          } else if (req.session.isCliente) {
            res.redirect("/cliente");
          }
        }
      }
    );
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
