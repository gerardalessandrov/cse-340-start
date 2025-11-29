const pool = require("../database/")

// Obtener lista de clasificaciones
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

// Obtener autos por clasificación
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (err) {
    console.error("getInventoryByClassificationId error", err)
  }
}

module.exports = { getClassifications, getInventoryByClassificationId }
