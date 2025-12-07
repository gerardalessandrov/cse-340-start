const favoriteModel = require("../models/favorite-model")
const utilities = require("../utilities")

const favCont = {}

/* Show user's favorites list */
favCont.buildFavorites = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const favorites = await favoriteModel.getFavoritesByAccountId(account_id)
    const nav = await utilities.getNav()
    
    res.render("favorites/list", {
      title: "My Favorites",
      nav,
      favorites,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* Add vehicle to favorites */
favCont.addFavorite = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body

    const result = await favoriteModel.addFavorite(account_id, inv_id)
    
    if (result) {
      req.flash("notice", "Vehicle added to favorites!")
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "This vehicle is already in your favorites.")
      res.redirect(`/inv/detail/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* Remove vehicle from favorites */
favCont.removeFavorite = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body

    const result = await favoriteModel.removeFavorite(account_id, inv_id)
    
    if (result) {
      req.flash("notice", "Vehicle removed from favorites.")
    } else {
      req.flash("notice", "Could not remove vehicle from favorites.")
    }
    
    res.redirect("/favorites")
  } catch (error) {
    next(error)
  }
}

module.exports = favCont