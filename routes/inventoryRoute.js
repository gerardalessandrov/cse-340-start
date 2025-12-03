const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const invValidate = require("../middleware/inventoryValidate");

router.get("/type/:classificationId", invController.buildByClassificationId)
router.get('/detail/:inv_id', invController.getVehicleDetail);
router.get("/error-test", invController.triggerError);
// Route to build the inventory management view
router.get("/", utilities.handleErrors(invController.inventoryView));
// Example in routes/inventoryRoute.js

// Route to render the add classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to process the new classification data
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);
module.exports = router
