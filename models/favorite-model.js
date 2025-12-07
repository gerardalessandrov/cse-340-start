const pool = require("../database/")

/* Add vehicle to favorites */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id) 
      VALUES ($1, $2) 
      RETURNING *
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("Add favorite error:", error)
    return null
  }
}

/* Remove vehicle from favorites */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites 
      WHERE account_id = $1 AND inv_id = $2
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount
  } catch (error) {
    console.error("Remove favorite error:", error)
    return 0
  }
}

/* Get all favorites for a user with vehicle details */
async function getFavoritesByAccountId(account_id) {
  try {
    const sql = `
      SELECT 
        f.favorite_id,
        f.created_at,
        i.*,
        c.classification_name
      FROM favorites f
      INNER JOIN inventory i ON f.inv_id = i.inv_id
      INNER JOIN classification c ON i.classification_id = c.classification_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("Get favorites error:", error)
    return []
  }
}

/* Check if vehicle is in user's favorites */
async function isFavorite(account_id, inv_id) {
  try {
    const sql = `
      SELECT * FROM favorites 
      WHERE account_id = $1 AND inv_id = $2
    `
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("Check favorite error:", error)
    return false
  }
}

/* Get favorite count for a user */
async function getFavoriteCount(account_id) {
  try {
    const sql = `SELECT COUNT(*) FROM favorites WHERE account_id = $1`
    const result = await pool.query(sql, [account_id])
    return parseInt(result.rows[0].count)
  } catch (error) {
    return 0
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccountId,
  isFavorite,
  getFavoriteCount
}