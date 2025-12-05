// backend/server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

import usersRoutes from "./routes/users.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🔗 Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // Cambia si tienes otro usuario
  password: "",      // Pon tu contraseña si usas una
  database: "delifood",
});

// ✅ Verificar conexión
db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err);
  } else {
    console.log("🟢 Conectado a la base de datos MySQL (delifood)");
  }
});

// ✅ Ruta de prueba
app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, rows) => {
    if (err) {
      console.error("❌ Error en la base de datos:", err);
      return res
        .status(500)
        .json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      message: "Conexión establecida",
      data: rows,
    });
  });
});

// ✅ LOGIN (ruta directa)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Faltan credenciales" });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ Error en la base de datos:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error del servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    console.log("✅ Usuario autenticado:", results[0]);
    res.status(200).json({ success: true, user: results[0] });
  });
});

// ✅ REGISTRO (ruta directa)
app.post("/api/register", (req, res) => {
  const { name, email, username, password, role } = req.body;
  const sql =
    "INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, email, username, password, role], (err) => {
    if (err) {
      console.error("❌ Error al registrar:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }
    res.json({
      success: true,
      message: "Usuario registrado exitosamente",
    });
  });
});

// ---------------------------------------------------------------------
// 👇 RUTAS ESPECÍFICAS PARA USUARIOS
// ---------------------------------------------------------------------

// ✅ Obtener TODOS los usuarios (para el UserManagement)
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      first_name,
      last_name,
      username,
      email,
      role,
      phone,
      avatar,
      is_verified,
      is_active,
      registration_date,
      last_login,
      created_at
    FROM users
    ORDER BY id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener usuarios:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener usuarios" });
    }

    res.json({ success: true, users: results });
  });
});

// ✅ Actualizar rol de un usuario
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res
      .status(400)
      .json({ success: false, message: "Rol requerido" });
  }

  const sql = "UPDATE users SET role = ? WHERE id = ?";

  db.query(sql, [role, id], (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar rol:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al actualizar rol" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, message: "Rol actualizado correctamente" });
  });
});

// ✅ Eliminar usuario
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar usuario:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al eliminar usuario" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, message: "Usuario eliminado correctamente" });
  });
});

// ---------------------------------------------------------------------
// 👇 RUTAS MONTADAS DESDE LOS ARCHIVOS /routes
// ---------------------------------------------------------------------

app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);   // carrito / menú
app.use("/api/orders", ordersRoutes);

// 🚀 Iniciar servidor
app.listen(5000, () => {
  console.log("✅ Servidor corriendo en puerto 5000");
});
