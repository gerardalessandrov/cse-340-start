const { body, validationResult } = require("express-validator")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model") // Necesario para la validación de unicidad, si se implementa.

/* ****************************************
 * Login validation rules
 * *************************************** */
function loginRules() {
  return [
    // account_email is required and must be an email
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

    // password is required and must be strong enough
    body("account_password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ]
}

/* ****************************************
 * Check data and return to login view or proceed
 * *************************************** */
function checkLoginData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // Cambiado a 'notice' para consistencia global
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    return res.redirect("/account/login")
  }
  next()
}

/* ****************************************
 * Account update validation rules (Name/Email)
 * *************************************** */
function updateAccountRules() {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

    // Nota: Aquí se debería agregar una validación de unicidad de email excluyendo el email actual del usuario.
  ]
}

/* ****************************************
 * Check data and return to update view or proceed
 * *************************************** */
function checkUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountId = req.body.account_id || res.locals.accountData?.account_id // Usar ID del cuerpo o de la sesión
    // Cambiado a 'notice' para consistencia global
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    // CORRECCIÓN: Usamos req.body.account_id o el ID de la sesión para redirigir
    return res.redirect(`/account/update/${accountId}`)
  }
  next()
}

/* ****************************************
 * Password change validation rules
 * *************************************** */
function updatePasswordRules() {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 12 }) // Se recomienda una longitud mínima de 12 para contraseñas.
      .withMessage("Password must be at least 12 characters.")
      .matches(/\d/)
      .withMessage("Password must contain at least one number.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[^A-Za-z0-9]/) // Agregada: al menos un carácter especial
      .withMessage("Password must contain at least one special character."),
  ]
}

/* ****************************************
 * Check data and return to update view or proceed
 * *************************************** */
function checkPasswordData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountId = req.body.account_id || res.locals.accountData?.account_id // Usar ID del cuerpo o de la sesión
    // Cambiado a 'notice' para consistencia global
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    // CORRECCIÓN: Usamos req.body.account_id o el ID de la sesión para redirigir
    return res.redirect(`/account/update/${accountId}`)
  }
  next()
}

module.exports = {
  loginRules,
  checkLoginData,
  updateAccountRules,
  checkUpdateData,
  updatePasswordRules,
  checkPasswordData,
}