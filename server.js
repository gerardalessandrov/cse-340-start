/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/

const express = require("express")
const expressLayouts=require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
// const session = require("express-session");
// const flash = require("connect-flash");
// requiere express-ejs-layouts uso de las plantillas ejs
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
// la plantilla layout debe ser encontrada en views
/* ***********************
/* ***********************
 * Routes
 *************************/
app.use(static)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   session({
//     secret: "supersecret",       // usa algo seguro
//     resave: false,
//     saveUninitialized: false,
//   })
// );
// app.use(flash());

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)
/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
// File Not Found Route - must be last route in list
// Global Error Handler
app.use(async function (err, req, res, next) {
  console.error("Global Error Handler:", err.stack);
  const nav = await utilities.getNav();
  res.status(500).render("error", {
    title: "Server Error",
    message: err.message,
    nav,
  });
});
app.use(async (req, res, next) => {
  const nav = await utilities.getNav();
  res.status(404).render("error", {
    title: "404",
    message: "Sorry, we appear to have lost that page.",
    nav,
  });
});
app.use(async (req, res, next) => {
  res.locals.nav = await Util.getNav();
  next();
});
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: 'Sorry, we appear to have lost that page.'
  })
})
/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  // Mensajes seguros
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
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
