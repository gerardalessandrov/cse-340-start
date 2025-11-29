const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  // Evitar error si no hay autos
  const className = data.length > 0 ? data[0].classification_name : "No vehicles"

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid
  })
}

module.exports = invCont
