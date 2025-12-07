const express = require("express")
const router = express.Router()
const favoriteController = require("../controllers/favoriteController")
const utilities = require("../utilities")

// View favorites list (requires login)
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.handleErrors(favoriteController.buildFavorites)
)

// Add to favorites (requires login)
router.post(
  "/add",
  utilities.checkJWTToken,
  utilities.handleErrors(favoriteController.addFavorite)
)

// Remove from favorites (requires login)
router.post(
  "/remove",
  utilities.checkJWTToken,
  utilities.handleErrors(favoriteController.removeFavorite)
)

module.exports = router