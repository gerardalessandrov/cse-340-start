// routes/accountRoute.js
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const accountValidation = require("../middleware/accountValidation")

// --------------------------
// LOGIN ROUTES
// --------------------------

// GET login page
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// POST login - authenticate user
router.post(
  "/login",
  accountValidation.loginRules(),
  accountValidation.checkLoginData,
  accountController.accountLogin
)

// --------------------------
// LOGOUT ROUTE
// --------------------------
router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
})

// --------------------------
// ACCOUNT MANAGEMENT ROUTES
// --------------------------

// GET account dashboard / management view
router.get(
  "/",
  utilities.checkJWTToken,        // Verifica JWT y llena res.locals
  utilities.handleErrors(accountController.buildAccountManagement)
)

// --------------------------
// ACCOUNT UPDATE ROUTES
// --------------------------

// GET account update form
router.get(
  "/update/:id",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildUpdateView)
)

// POST account update (first name, last name, email)
router.post(
  "/update/:id",
  utilities.checkJWTToken,
  accountValidation.updateAccountRules(),
  accountValidation.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// POST password change
router.post(
  "/update-password/:id",
  utilities.checkJWTToken,
  accountValidation.updatePasswordRules(),
  accountValidation.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router
