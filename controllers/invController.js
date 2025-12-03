const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  // Evitar error si no hay   
  const className = data.length > 0 ? data[0].classification_name : "No vehicles"

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid
  })
}
invCont.getVehicleDetail = async (req, res, next) => {
   const invId = req.params.inv_id; // Obtiene el ID de la URL

  try {
    const vehicleData = await invModel.getVehicleById(invId); // Busca en DB
    if (!vehicleData) {
      return res.status(404).send("Vehículo no encontrado.");
    }

    const detailHtml = await utilities.buildVehicleHTML(vehicleData); // Envuelve en HTML
    const nav = await utilities.getNav();
    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detailHtml, // Enviamos HTML ya listo
    });
  } catch (error) {
    next(error);
  }
};
invCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("Oh no! There was a crash. Maybe try a different route");
  } catch (err) {
    next(err);
  }
};
// Example in inventoryController.js
invCont.inventoryView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav(); // Assume utilities.getNav() exists
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      // Flash message will be automatically available via res.locals.message
    });
  } catch (error) {
    next(error);
  }
};
// Example in inventoryController.js

// Function to render the add classification view
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

// Function to handle the classification addition
// controllers/invController.js

invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  const classificationResult = await invModel.addClassification(
    classification_name
  );

  if (classificationResult) {
    // req.flash(
    //   "notice",
    //   `The ${classification_name} classification was successfully added.`
    // );

    // 💡 PASO CLAVE 1: RECONSTRUIR la navegación con el nuevo dato
    let newNav = await utilities.getNav();

    // 💡 PASO CLAVE 2: ACTUALIZAR la navegación en res.locals para la siguiente request
    res.locals.nav = newNav; // <--- Esto es lo que necesitas para la siguiente página

    res.redirect("/inv/"); // Redirigir al management view
  } else {
    // ... (código de fallo)
  }
};
// En tu archivo de rutas:
// Example in inventoryController.js

// Function to render the add inventory view
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  // Build the classification select list
  const classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    classificationList,
    errors: null,
    // Provide initial empty values for stickiness (important if rendering for the first time)
    classification_id: "",
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
  });
};

// Function to handle the inventory addition
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const invResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (invResult) {
    // req.flash(
    //   "notice",
    //   `The ${inv_make} ${inv_model} was successfully added to the inventory.`
    // );
    res.redirect("/inv/"); // Render the management view on success
  } else {
    // req.flash("notice", "Sorry, adding the inventory item failed.");
    let nav = await utilities.getNav();
    // Rebuild the classification list with the previous ID for stickiness on failure
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );

    res.render("inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors: null,
      // Pass all body data back for stickiness
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
};


module.exports = invCont
