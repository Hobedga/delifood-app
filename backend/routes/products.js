// backend/routes/products.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * 🔹 Lista de productos para clientes (solo activos)
 * GET /api/products
 */
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      id,
      restaurant_id,
      name,
      description,
      price,
      stock,
      preparation_time,
      is_active AS is_available
    FROM products
    WHERE is_active = 1
    ORDER BY name ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener productos:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }
    res.json({ success: true, products: rows });
  });
});

/**
 * 🔹 Menú de un restaurante (para el panel del restaurante)
 * GET /api/products/my-menu?restaurantId=ID
 */
router.get("/my-menu", (req, res) => {
  // aceptar restaurantId o restaurant_id
  const restaurantId = req.query.restaurantId || req.query.restaurant_id;

  if (!restaurantId) {
    return res
      .status(400)
      .json({ success: false, message: "Falta restaurantId" });
  }

  const sql = `
    SELECT 
      id,
      restaurant_id,
      name,
      description,
      price,
      stock,
      preparation_time,
      is_active AS is_available
    FROM products
    WHERE restaurant_id = ?
    ORDER BY name ASC
  `;

  db.query(sql, [restaurantId], (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener menú del restaurante:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }
    res.json({ success: true, products: rows });
  });
});


/**
 * 🔹 (Opcional) productos por restaurante para clientes
 * GET /api/products/by-restaurant/:restaurantId
 */
router.get("/by-restaurant/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  const sql = `
    SELECT 
      id,
      restaurant_id,
      name,
      description,
      price,
      stock,
      preparation_time,
      is_active AS is_available
    FROM products
    WHERE restaurant_id = ? AND is_active = 1
    ORDER BY name ASC
  `;

  db.query(sql, [restaurantId], (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener productos por restaurante:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }
    res.json({ success: true, products: rows });
  });
});

/**
 * 🔹 Crear producto (desde panel restaurante)
 * POST /api/products
 */
router.post("/", (req, res) => {
  const {
    restaurant_id,
    name,
    description,
    price,
    stock,
    preparation_time,
    is_available,
  } = req.body;

  if (!restaurant_id || !name || price == null || stock == null) {
    return res.status(400).json({
      success: false,
      message: "Faltan datos (restaurant_id, name, price, stock)",
    });
  }

  const sql = `
    INSERT INTO products
      (restaurant_id, name, description, price, stock, preparation_time, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      restaurant_id,
      name,
      description || "",
      price,
      stock,
      preparation_time != null ? preparation_time : 15,
      is_available ? 1 : 0,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Error al crear producto:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      }

      const newProduct = {
        id: result.insertId,
        restaurant_id,
        name,
        description: description || "",
        price,
        stock,
        preparation_time: preparation_time != null ? preparation_time : 15,
        is_available: is_available ? 1 : 0,
      };

      res.json({
        success: true,
        message: "Producto creado correctamente",
        product: newProduct,
      });
    }
  );
});

/**
 * 🔹 Actualizar producto
 * PUT /api/products/:id
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    stock,
    preparation_time,
    is_available,
  } = req.body;

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (description !== undefined) {
    fields.push("description = ?");
    values.push(description);
  }
  if (price !== undefined) {
    fields.push("price = ?");
    values.push(price);
  }
  if (stock !== undefined) {
    fields.push("stock = ?");
    values.push(stock);
  }
  if (preparation_time !== undefined) {
    fields.push("preparation_time = ?");
    values.push(preparation_time);
  }
  if (is_available !== undefined) {
    fields.push("is_active = ?");
    values.push(is_available ? 1 : 0);
  }

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No se proporcionaron campos para actualizar",
    });
  }

  const sql = `
    UPDATE products
    SET ${fields.join(", ")}
    WHERE id = ?
  `;
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) {
      console.error("❌ Error al actualizar producto:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    db.query(
      `
      SELECT 
        id,
        restaurant_id,
        name,
        description,
        price,
        stock,
        preparation_time,
        is_active AS is_available
      FROM products
      WHERE id = ?
      `,
      [id],
      (err2, rows) => {
        if (err2) {
          console.error("❌ Error al leer producto actualizado:", err2);
          return res.json({
            success: true,
            message: "Producto actualizado",
          });
        }
        res.json({
          success: true,
          message: "Producto actualizado",
          product: rows[0],
        });
      }
    );
  });
});

/**
 * 🔹 Eliminar producto
 * DELETE /api/products/:id
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar producto:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }

    res.json({ success: true, message: "Producto eliminado correctamente" });
  });
});

/**
 * 🔹 Validar carrito (stock + disponibilidad)
 * POST /api/products/validate-cart
 */
router.post("/validate-cart", (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Carrito vacío o inválido" });
  }

  const ids = items.map((i) => i.productId);

  const sql = `
    SELECT 
      id,
      name,
      stock,
      is_active AS is_available
    FROM products
    WHERE id IN (?)
  `;

  db.query(sql, [ids], (err, rows) => {
    if (err) {
      console.error("❌ Error al validar carrito:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    const problems = [];

    items.forEach((item) => {
      const product = rows.find((p) => p.id === item.productId);
      if (!product) {
        problems.push({
          productId: item.productId,
          reason: "PRODUCT_NOT_FOUND",
        });
        return;
      }

      if (!product.is_available) {
        problems.push({
          productId: product.id,
          name: product.name,
          reason: "NOT_AVAILABLE",
        });
        return;
      }

      if (product.stock < item.quantity) {
        problems.push({
          productId: product.id,
          name: product.name,
          reason: "NOT_ENOUGH_STOCK",
          available: product.stock,
          requested: item.quantity,
        });
      }
    });

    if (problems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Algunos productos no están disponibles",
        problems,
      });
    }

    res.json({ success: true, message: "Carrito válido" });
  });
});

export default router;
