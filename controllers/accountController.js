const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
// CORRECCIÓN: Un solo require, sin errores tipográficos.
const bcrypt = require("bcryptjs") 
const utilities=require("../utilities")
/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  // CORRECCIÓN: Leer los mensajes 'notice' (usado por JWT check) y 'message' (usado por accountLogin)
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    // Utilizamos una clave común ('notice') para ser coherentes con utilities/index.js
    // Aunque la plantilla EJS debe manejar la lógica de mostrar 'notice'
    message: req.flash("notice") || req.flash("message") || "", 
  })
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res) {
  const accountData = res.locals.accountData;
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
 *  Handle login submission
 * *************************************** */
async function accountLogin(req, res) {
  // CORRECCIÓN: El mensaje de error flash debe usar la clave 'notice' para consistencia con el layout
  const nav = await utilities.getNav();

  try {
    const { account_email, account_password } = req.body

    // Buscar el usuario en la base de datos
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )
    if (!passwordMatch) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    // Eliminar la contraseña del objeto antes de crear el JWT (Buena Práctica de Seguridad)
    delete accountData.account_password;

    // Crear JWT
    const payload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
    }

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    })

    // Guardar token en cookie
    res.cookie("jwt", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 }) // 2 horas de expiración

    // Redirigir a account dashboard
    return res.redirect("/account/")
  } catch (error) {
    console.error("Login Error:", error);
    
    // Si ocurre un error, volvemos a renderizar el login con el nav
    res.render("account/login", { 
      title: "Login", 
      nav, 
      errors: [{ msg: "A server error occurred during login." }]
    });
  }
}

/* ****************************************
 *  Deliver update account view
 * *************************************** */
async function buildUpdateView(req, res) {
  const account_id = res.locals.accountData.account_id // Obtenemos el ID del JWT (más seguro)
  const data = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav();

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: data.account_id,
    account_firstname: data.account_firstname,
    account_lastname: data.account_lastname,
    account_email: data.account_email
  })
}

/* ****************************************
 *  Handle account update submission (name/email)
 * *************************************** */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  const result = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
  const nav = await utilities.getNav();

  if (result) {
    // La lógica correcta es recrear el JWT con los datos nuevos
    const updatedData = await accountModel.getAccountById(account_id);
    
    // Crear un nuevo token para el usuario
    const payload = {
      account_id: updatedData.account_id,
      account_firstname: updatedData.account_firstname,
      account_type: updatedData.account_type,
    }
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    })
    res.cookie("jwt", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 })
    
    req.flash("notice", "Account updated successfully. Session refreshed.")
    res.redirect("/account/") // Redirigir al dashboard para ver el mensaje flash
  } else {
    req.flash("notice", "Update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
 *  Handle password update submission
 * *************************************** */
async function updatePassword(req, res) {
  const { password, account_id } = req.body

  // 1. Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(password, 10)

  // 2. Actualizar en la base de datos
  const result = await accountModel.updatePassword(hashedPassword, account_id)

  const accountData = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav();

  if (result) {
    req.flash("notice", "Password updated successfully.")
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData
    })
  } else {
    req.flash("notice", "Password update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
 *  Log out
 * *************************************** */
async function accountLogout(req, res) {
  // Borrar la cookie JWT
  res.clearCookie("jwt");
  
  // Inyectar mensaje flash
  req.flash("notice", "You have been successfully logged out.");
  
  // Redirigir a la página de inicio
  res.redirect("/");
}

module.exports = {
  buildUpdateView,
  updateAccount,
  updatePassword,
  buildLogin,
  accountLogin,
  buildAccountManagement,
  accountLogout // Asegúrese de exportar esta función
}