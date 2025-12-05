// backend/routes/orders.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * POST /api/orders/preview
 * Valida stock y horarios, calcula costos y tiempos.
 * Body: { userId, items: [{ productId, quantity }] }
 */
router.post("/preview", (req, res) => {
  const { userId, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "El carrito está vacío" });
  }

  const ids = items.map((i) => i.productId);
  const placeholders = ids.map(() => "?").join(",");

  const sql = `
    SELECT id, name, price, stock, preparation_time, is_active
    FROM products
    WHERE id IN (${placeholders})
  `;

  db.query(sql, ids, (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener productos:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    // Mapear productos por id
    const productMap = new Map();
    rows.forEach((p) => productMap.set(p.id, p));

    let subtotal = 0;
    let maxPrepTime = 0;
    const detail = [];
    let hasError = false;

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product || !product.is_active) {
        detail.push({
          ...item,
          ok: false,
          reason: "Producto no disponible",
        });
        hasError = true;
        continue;
      }

      if (product.stock < item.quantity) {
        detail.push({
          ...item,
          ok: false,
          reason: `Stock insuficiente (disponible: ${product.stock})`,
        });
        hasError = true;
        continue;
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      if (product.preparation_time > maxPrepTime) {
        maxPrepTime = product.preparation_time;
      }

      detail.push({
        ...item,
        ok: true,
        name: product.name,
        unitPrice: product.price,
        lineTotal,
      });
    }

    // ❗ Validación de horario (ejemplo simple: 9am–22pm)
    const now = new Date();
    const hour = now.getHours();
    const dentroHorario = hour >= 9 && hour <= 22;

    if (!dentroHorario) {
      hasError = true;
    }

    // Cálculo de costos y tiempos
    const deliveryFee =
      subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 40; // ejemplo
    const etaMinutes = maxPrepTime + 20; // preparación + reparto

    return res.json({
      success: !hasError,
      hasError,
      cart: detail,
      totals: {
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
      },
      etaMinutes,
      horario: {
        dentroHorario,
        message: dentroHorario
          ? "Dentro del horario de servicio"
          : "Fuera del horario de servicio (9:00–22:00)",
      },
    });
  });
});

/**
 * POST /api/orders/confirm
 * Vuelve a validar, descuenta stock, crea pedido y genera notificación.
 * Body: { userId, items: [{ productId, quantity }] }
 */
router.post("/confirm", (req, res) => {
  const { userId, items } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "Falta el usuario" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "El carrito está vacío" });
  }

  // Reutilizamos la lógica de preview, pero ahora dentro de una transacción.
  const ids = items.map((i) => i.productId);
  const placeholders = ids.map(() => "?").join(",");

  const sqlProducts = `
    SELECT id, name, price, stock, preparation_time, is_active
    FROM products
    WHERE id IN (${placeholders})
  `;

  db.query(sqlProducts, ids, (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener productos:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    const productMap = new Map();
    rows.forEach((p) => productMap.set(p.id, p));

    let subtotal = 0;
    let maxPrepTime = 0;
    const detail = [];
    let hasError = false;

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product || !product.is_active) {
        hasError = true;
        break;
      }
      if (product.stock < item.quantity) {
        hasError = true;
        break;
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      if (product.preparation_time > maxPrepTime) {
        maxPrepTime = product.preparation_time;
      }

      detail.push({ product, quantity: item.quantity, lineTotal });
    }

    const now = new Date();
    const hour = now.getHours();
    const dentroHorario = hour >= 9 && hour <= 22;

    if (!dentroHorario) hasError = true;

    if (hasError || subtotal === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se pudo confirmar el pedido. Verifica stock y horario de servicio.",
      });
    }

    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const etaMinutes = maxPrepTime + 20;

    // 🔄 Iniciamos transacción
    db.beginTransaction((err) => {
      if (err) {
        console.error("❌ Error al iniciar transacción:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      }

      const sqlOrder = `
        INSERT INTO orders (user_id, total, delivery_fee, eta_minutes)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        sqlOrder,
        [userId, subtotal + deliveryFee, deliveryFee, etaMinutes],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Error al crear pedido:", err);
              res
                .status(500)
                .json({ success: false, message: "Error al crear pedido" });
            });
          }

          const orderId = result.insertId;

          // Insertar items
          const sqlItems = `
            INSERT INTO order_items
              (order_id, product_id, quantity, unit_price)
            VALUES ?
          `;
          const values = detail.map((d) => [
            orderId,
            d.product.id,
            d.quantity,
            d.product.price,
          ]);

          db.query(sqlItems, [values], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("❌ Error al insertar items:", err);
                res.status(500).json({
                  success: false,
                  message: "Error al guardar items del pedido",
                });
              });
            }

            // Descontar stock por cada producto
            const updatePromises = detail.map(
              (d) =>
                new Promise((resolve, reject) => {
                  const sqlUpdate =
                    "UPDATE products SET stock = stock - ? WHERE id = ?";
                  db.query(
                    sqlUpdate,
                    [d.quantity, d.product.id],
                    (err, r) => (err ? reject(err) : resolve(r))
                  );
                })
            );

            Promise.all(updatePromises)
              .then(() => {
                // Crear notificación simple
                const sqlNotif = `
                  INSERT INTO notifications (user_id, message)
                  VALUES (?, ?)
                `;
                const message = `Tu pedido #${orderId} ha sido confirmado. Tiempo estimado: ${etaMinutes} min.`;
                db.query(sqlNotif, [userId, message], (err) => {
                  if (err) {
                    console.warn("⚠️ Error al crear notificación:", err);
                    // no rompemos la transacción por esto
                  }

                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("❌ Error al confirmar transacción:", err);
                        res.status(500).json({
                          success: false,
                          message: "Error al confirmar pedido",
                        });
                      });
                    }

                    res.json({
                      success: true,
                      orderId,
                      totals: {
                        subtotal,
                        deliveryFee,
                        total: subtotal + deliveryFee,
                      },
                      etaMinutes,
                      message,
                    });
                  });
                });
              })
              .catch((err) => {
                db.rollback(() => {
                  console.error("❌ Error al actualizar stock:", err);
                  res.status(500).json({
                    success: false,
                    message: "Error al actualizar stock",
                  });
                });
              });
          });
        }
      );
    });
  });
});

/* -------------------------------------------------------------------------- */
/* 🆕 1) Pedidos para repartidor: /api/orders/for-delivery                    */
/* -------------------------------------------------------------------------- */

router.get("/for-delivery", (req, res) => {
  const sql = `
    SELECT
      o.id,
      o.user_id,
      o.total,
      o.delivery_fee,
      o.eta_minutes,
      o.status,
      o.created_at,
      c.name   AS client_name,
      c.username AS client_username,
      r.name   AS restaurant_name,
      r.username AS restaurant_username
    FROM orders o
    JOIN users c ON o.user_id = c.id
    LEFT JOIN (
      SELECT 
        oi.order_id,
        MIN(p.restaurant_id) AS restaurant_id
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY oi.order_id
    ) op ON op.order_id = o.id
    LEFT JOIN users r ON op.restaurant_id = r.id
    WHERE o.status IN ('pendiente','preparando','en_camino')
    ORDER BY o.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error obteniendo pedidos para repartidor:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener pedidos" });
    }

    res.json({
      success: true,
      orders: rows,
    });
  });
});

/* -------------------------------------------------------------------------- */
/* 🆕 2) Pedidos por restaurante: /api/orders/by-restaurant/:restaurantId    */
/* -------------------------------------------------------------------------- */

router.get("/by-restaurant/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  const sql = `
    SELECT
      o.id,
      o.user_id,
      o.total,
      o.delivery_fee,
      o.eta_minutes,
      o.status,
      o.created_at,
      c.name     AS client_name,
      c.username AS client_username
    FROM orders o
    JOIN users c       ON o.user_id = c.id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p     ON oi.product_id = p.id
    WHERE p.restaurant_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [restaurantId], (err, rows) => {
    if (err) {
      console.error("❌ Error obteniendo pedidos del restaurante:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener pedidos" });
    }

    res.json({
      success: true,
      orders: rows,
    });
  });
});

// 🟠 Pedidos por restaurante (para el panel del RESTAURANTE)
router.get("/by-restaurant/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res
      .status(400)
      .json({ success: false, message: "Falta restaurantId" });
  }

  const sql = `
    SELECT
      o.id,
      o.user_id,
      o.total,
      o.delivery_fee,
      o.eta_minutes,
      o.status,
      o.created_at,
      u.name AS client_name,
      u.username AS client_username
    FROM orders o
    INNER JOIN users u ON u.id = o.user_id
    INNER JOIN order_items oi ON oi.order_id = o.id
    INNER JOIN products p ON p.id = oi.product_id
    WHERE p.restaurant_id = ?
    GROUP BY
      o.id,
      o.user_id,
      o.total,
      o.delivery_fee,
      o.eta_minutes,
      o.status,
      o.created_at,
      u.name,
      u.username
    ORDER BY o.created_at DESC
    LIMIT 50;
  `;

  db.query(sql, [restaurantId], (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener pedidos por restaurante:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener pedidos" });
    }

    res.json({
      success: true,
      orders: rows,
    });
  });
});


export default router;
