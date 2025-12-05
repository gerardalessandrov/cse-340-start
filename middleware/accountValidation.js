const { body, validationResult } = require("express-validator")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ****************************************
 * Registration validation rules
 * *************************************** */
function registrationRules() {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ****************************************
 * Check registration data
 * *************************************** */
async function checkRegData(req, res, next) {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

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
 * Check login data
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
 * Account update validation rules
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
 * Check update data
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
    body("password")
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
 * Check password data
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
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  updateAccountRules,
  checkUpdateData,
  updatePasswordRules,
  checkPasswordData,
}