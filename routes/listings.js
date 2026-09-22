const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner , validateListing} = require("../middleware.js");
const ListingController = require("../controller/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});
 

router
.route("/")
.get(wrapAsync (ListingController.index))
.post( upload.single('listing[image]'),validateListing , isLoggedIn,wrapAsync(ListingController.createListing));


 // new route
router.get("/new" , isLoggedIn ,ListingController.renderNewForm);


router.route("/:id")
.get( wrapAsync(ListingController.showListings))
.put(isOwner,isLoggedIn,upload.single('listing[image]'),validateListing ,wrapAsync(ListingController.updateListing ))
.delete(isLoggedIn , isOwner,wrapAsync(ListingController.deleteListing));

//edit route
router.get("/:id/edit" ,isLoggedIn,isOwner, wrapAsync(ListingController.editListing));


module.exports = router;