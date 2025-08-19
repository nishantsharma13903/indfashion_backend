const express = require("express");
const wishlistRouter = express.Router();
const wishlistController = require("../controller/wishlistController");
const verifyToken = require("../../../middlewares/verifyJWT");

wishlistRouter.post("/add", verifyToken.decodeToken, wishlistController.addToWishlist);
wishlistRouter.post("/remove", verifyToken.decodeToken, wishlistController.removeFromWishlist);
wishlistRouter.get("/get-all", verifyToken.decodeToken, wishlistController.getWishlist);

module.exports = wishlistRouter;