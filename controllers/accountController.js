const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs") 
const utilities = require("../utilities")

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Registration Error:", error)
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res) {
  const accountData = res.locals.accountData
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
 *  Handle login submission
 * *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()

  try {
    const { account_email, account_password } = req.body

    // Find user in database
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )
    if (!passwordMatch) {
      req.flash("notice", "Invalid email or password.")
      return res.redirect("/account/login")
    }

    // Remove password from object before creating JWT
    delete accountData.account_password

    // Create JWT
    const payload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
    }

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    })

    // Save token in cookie
    res.cookie("jwt", token, { 
      httpOnly: true, 
      maxAge: 2 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production'
    })

    // Redirect to account dashboard
    return res.redirect("/account/")
  } catch (error) {
    console.error("Login Error:", error)
    res.render("account/login", { 
      title: "Login", 
      nav, 
      errors: [{ msg: "A server error occurred during login." }]
    })
  }
}

/* ****************************************
 *  Deliver update account view
 * *************************************** */
async function buildUpdateView(req, res) {
  const account_id = res.locals.accountData.account_id
  const data = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()

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
 *  Handle account update submission (name/email)
 * *************************************** */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  try {
    const result = await accountModel.updateAccount(
      account_firstname, 
      account_lastname, 
      account_email, 
      account_id
    )
    const nav = await utilities.getNav()

    if (result) {
      // Recreate JWT with new data
      const updatedData = await accountModel.getAccountById(account_id)
      
      const payload = {
        account_id: updatedData.account_id,
        account_firstname: updatedData.account_firstname,
        account_type: updatedData.account_type,
      }
      
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2h",
      })
      
      res.cookie("jwt", token, { 
        httpOnly: true, 
        maxAge: 2 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production'
      })
      
      req.flash("notice", "Account updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Update failed.")
      res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    console.error("Update Account Error:", error)
    req.flash("notice", "An error occurred while updating the account.")
    res.redirect(`/account/update/${req.body.account_id}`)
  }
}

/* ****************************************
 *  Handle password update submission
 * *************************************** */
async function updatePassword(req, res) {
  const { password, account_id } = req.body

  try {
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update in database
    const result = await accountModel.updatePassword(hashedPassword, account_id)

    if (result) {
      req.flash("notice", "Password updated successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Password update failed.")
      res.redirect(`/account/update/${account_id}`)
    }
  } catch (error) {
    console.error("Update Password Error:", error)
    req.flash("notice", "An error occurred while updating the password.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
 *  Log out
 * *************************************** */
async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been successfully logged out.")
  res.redirect("/")
}

module.exports = {
  buildRegister,
  registerAccount,
  buildUpdateView,
  updateAccount,
  updatePassword,
  buildLogin,
  accountLogin,
  buildAccountManagement,
  accountLogout
}