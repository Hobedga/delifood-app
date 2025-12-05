// routes/users.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

/* ------------------------------------------------------------------ */
/*  📌 OBTENER TODOS LOS USUARIOS                                     */
/* ------------------------------------------------------------------ */
router.get("/", (req, res) => {
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

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener usuarios:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    // el front espera { success, users: [...] }
    res.json({ success: true, users: rows });
  });
});

/* ------------------------------------------------------------------ */
/*  ✅ REGISTRO DE USUARIO                                            */
/*  (lo mantenemos como ya lo tenías)                                  */
/* ------------------------------------------------------------------ */
router.post("/register", (req, res) => {
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

/* ------------------------------------------------------------------ */
/*  ✅ LOGIN (igual que lo tenías, pero bajo /api/users/login)        */
/* ------------------------------------------------------------------ */
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Credenciales incorrectas" });
    }

    res.json({ success: true, user: results[0] });
  });
});

/* ------------------------------------------------------------------ */
/*  ✏️ ACTUALIZAR USUARIO (rol / activo / verificado)                 */
/*  - Si solo envías { role: "admin" } solo se cambia el rol          */
/* ------------------------------------------------------------------ */
router.put("/:id", (req, res) => {
  const userId = req.params.id;
  const { role, is_active, is_verified } = req.body;

  const sql = `
    UPDATE users 
    SET 
      role        = COALESCE(?, role),
      is_active   = COALESCE(?, is_active),
      is_verified = COALESCE(?, is_verified)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      role ?? null,
      is_active ?? null,
      is_verified ?? null,
      userId,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Error al actualizar usuario:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      }

      res.json({
        success: true,
        message: "Usuario actualizado correctamente",
      });
    }
  );
});

/* ------------------------------------------------------------------ */
/*  🗑️ ELIMINAR USUARIO                                               */
/* ------------------------------------------------------------------ */
router.delete("/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar usuario:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  });
});

export default router;
