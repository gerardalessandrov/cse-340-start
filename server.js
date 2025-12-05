/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute") // ← AGREGAR ESTA LÍNEA
const utilities = require("./utilities/")
const session = require("express-session")
const flash = require("connect-flash")
const cookieParser = require("cookie-parser") // ← AGREGAR (necesario para JWT)
const jwt = require("jsonwebtoken") // ← AGREGAR (necesario para verificar JWT)
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware - ORDEN CORRECTO
 *************************/
app.use(static)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // ← AGREGAR (debe ir antes de session)

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret", // Mejor usar variable de entorno
    resave: false,
    saveUninitialized: false,
  })
)
app.use(flash())

// Middleware para hacer disponible el nav globalmente
app.use(async (req, res, next) => {
  res.locals.nav = await utilities.getNav()
  next()
})

// Middleware para verificar JWT y establecer locals
app.use(async (req, res, next) => {
  const token = req.cookies?.jwt
  if (token) {
    try {
      const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      res.locals.loggedin = true
      res.locals.accountData = accountData
    } catch (err) {
      res.locals.loggedin = false
      res.locals.accountData = null
      res.clearCookie("jwt")
    }
  } else {
    res.locals.loggedin = false
    res.locals.accountData = null
  }
  next()
})

/* ***********************
 * Routes
 *************************/
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes ← AGREGAR ESTA LÍNEA
app.use("/account", accountRoute)

/* ***********************
 * Error Handlers - DEBEN IR AL FINAL
 *************************/
// 404 Handler
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: 'Sorry, we appear to have lost that page.'
  })
})

// Global Error Handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let message
  if (err.status == 404) {
    message = err.message
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }

  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})