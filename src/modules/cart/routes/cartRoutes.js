const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controller/cartController");
const verifyJWT = require('../../../middlewares/verifyJWT');

cartRouter.post("/add", verifyJWT.decodeToken, cartController.addOrUpdateItem);
cartRouter.post("/remove", verifyJWT.decodeToken, cartController.removeItem);
cartRouter.get("/get-all", verifyJWT.decodeToken, cartController.getCart);

module.exports = cartRouter;
