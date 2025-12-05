const { body, validationResult } = require("express-validator")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ****************************************
 * Login validation rules
 * *************************************** */
function loginRules() {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),

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
  ]
}

/* ****************************************
 * Check data and return to update view or proceed
 * *************************************** */
function checkUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountId = req.body.account_id || res.locals.accountData?.account_id
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
    return res.redirect(`/account/update/${accountId}`)
  }
  next()
}

/* ****************************************
 * Password change validation rules
 * *************************************** */
function updatePasswordRules() {
  return [
    body("password") // ← CORREGIDO: era "account_password"
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(/\d/)
      .withMessage("Password must contain at least one number.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must contain at least one special character."),
  ]
}

/* ****************************************
 * Check data and return to update view or proceed
 * *************************************** */
function checkPasswordData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountId = req.body.account_id || res.locals.accountData?.account_id
    req.flash("notice", errors.array().map(e => e.msg).join(" "))
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