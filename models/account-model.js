const pool = require("../database/")

/* =============================
 * 1. REGISTRO DE NUEVA CUENTA
 * Función para insertar un nuevo usuario.
 * ============================= */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
  try {
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password, // Esto DEBE ser la contraseña hasheada
    ])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* =============================
 * 2. OBTENER CUENTA POR CORREO (CRÍTICO PARA LOGIN)
 * Función para encontrar un usuario por su email.
 * ============================= */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* =============================
 * 3. Get account by ID
 * ============================= */
async function getAccountById(account_id) {
  const sql = `SELECT * FROM account WHERE account_id = $1`
  const result = await pool.query(sql, [account_id])
  return result.rows[0]
}

/* =============================
 * 4. Update account info
 * ============================= */
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  const sql = `
    UPDATE account 
    SET account_firstname=$1,
        account_lastname=$2,
        account_email=$3
    WHERE account_id=$4
    RETURNING *
  `
  try {
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ])
    return result.rowCount
  } catch (error) {
    console.error("Update account failed: " + error);
    return 0;
  }
}

/* =============================
 * 5. Update password
 * ============================= */
async function updatePassword(hashedPassword, account_id) {
  const sql = `
    UPDATE account 
    SET account_password=$1
    WHERE account_id=$2
    RETURNING *
  `
  try {
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rowCount
  } catch (error) {
    console.error("Update password failed: " + error);
    return 0;
  }
}

/* =============================
 * 6. Check if email exists (Necesario para el registro)
 * ============================= */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* =============================s
 * Export functions
 * ============================= */
module.exports = {
  getAccountById,
  updateAccount,
  updatePassword,
  registerAccount, // Añadida
  getAccountByEmail, // Añadida
  checkExistingEmail, // Añadida
}