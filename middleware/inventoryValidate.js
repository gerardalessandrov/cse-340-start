// Example in middleware/inventoryValidate.js
const { body, validationResult } = require("express-validator");
const validate = {};
const utilities = require("../utilities/");

validate.classificationRules = () => {
  return [
    // classification_name is required and must not contain spaces or special characters
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage(
        "Classification name must not contain spaces or special characters."
      ),
  ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name, // Stickiness (though only one field)
    });
    return;
  }
  next();
};
// Example in middleware/inventoryValidate.js

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .isInt()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    // ... (Add validation rules for all other inventory fields: model, year, description, image, thumbnail, price, miles, color) ...

    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please enter a valid year."),

    body("inv_price")
      .isFloat({ min: 1 })
      .withMessage("Price must be a positive number."),

    // Note: The `inv_image` and `inv_thumbnail` should be validated against the required path format.
  ];
};

validate.checkInventoryData = async (req, res, next) => {
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
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // Rebuild the classification list with the previously selected ID for stickiness
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );

    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Inventory Item",
      nav,
      classificationList,
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
    return;
  }
  next();
};
module.exports = validate;