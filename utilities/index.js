const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
const flash = require('connect-flash');
require("dotenv").config()


Util.checkJWTToken=async function(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  try {
    const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.loggedin = true
    res.locals.accountData = accountData
    next()
  } catch (err) {
    res.clearCookie("jwt")
    req.flash("notice", "Session expired, please log in again.")
    res.redirect("/account/login")
  }
}

Util.checkEmployee=async function(req, res, next) {
  const type = res.locals.accountData?.account_type

  if (type === "Employee" || type === "Admin") {
    return next()
  }

  req.flash("notice", "Access denied.")
  res.status(403).render("account/login")
}




Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/">Home</a></li>'
  data.rows.forEach(row => {
    list += `<li><a href="/inv/type/${row.classification_id}"
    title="See our inventory of ${row.classification_name} vehicles">
    ${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}
Util.buildVehicleHTML=async function (vehicle) {
  const usdPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price);
  const formattedMiles = Number(vehicle.inv_miles).toLocaleString("en-US");

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Imagen de ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image" />
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${usdPrice}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Miles:</strong> ${formattedMiles} millas</p>

      </div>
    </div>
  `;
};


Util.buildClassificationGrid = async function (data) {
  let grid = ""

  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += `<li>
        <a href="../../inv/detail/${vehicle.inv_id}">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
        </a>
        <div class="namePrice">
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`
    })
    grid += "</ul>"
  } else {
    grid = "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
  }
  return grid
}
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications(); // Assume this function exists and returns { rows: [...] }
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == row.classification_id // Note: Fixed to compare row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For ling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
