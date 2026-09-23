 const mongoose = require("mongoose");
 const Listing = require("../models/listing");
 const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geoCoding');
 const mapToken = process.env.MAP_TOKEN;
 const geocodingClient = mbxGeoCoding({ accessToken: mapToken});

 
 module.exports.index = async (req , res) =>{
    let allListings =await  Listing.find({});
    res.render("lisitngs/index.ejs" , {allListings});
};

module.exports.renderNewForm =  (req , res) =>{

    res.render("lisitngs/new.ejs");
};
 const CATEGORIES = [
    "Trending", "Rooms", "Iconic cities", "Mountains",
    "Castles", "Amazing Pools", "Camping", "Farm", "Arctic", "Domes", "Boats",
];

module.exports.showListings = async(req , res) =>{
    let {id} = req.params;
    if (CATEGORIES.includes(id)) {
        let allListings = await Listing.find({ category: id });
        return res.render("lisitngs/index.ejs", { allListings, category: id });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing or category");
        return res.redirect("/listings");
    }
     const listing =  await Listing.findById(id).populate({
        path: "review",
        populate:{
            path: "author",
        }
     }).populate("owner");
     if(!listing){
        req.flash("error", "this listing does not exist");
       return  res.redirect("/listings");
     }
     res.render("lisitngs/show.ejs" , {listing});
};

module.exports.createListing = async(req , res ,next) =>{
    let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
   })
  .send();
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
     newListing.owner = req.user._id;
    newListing.image = {url , filename};
    newListing.geometry = response.body.features[0].geometry;
     let savedListing = await newListing.save();
     console.log(savedListing);
    req.flash("success","New Listings Added!");
    res.redirect("/listings");
     
};

module.exports.editListing = async(req , res , next) =>{
        let {id} = req.params;
     const listing =  await Listing.findById(id);
      if(!listing){
        req.flash("error", "this listing does not exist");
        res.redirect("/listings");
     }
     let originalImageURL = listing.image.url;
     originalImageURL=  originalImageURL.replace("/upload" , "/upload/h_300,w_100");
     res.render("lisitngs/edit.ejs", {listing , originalImageURL});

};

module.exports.updateListing = async(req,res) =>{
      let {id} = req.params;
      let listing =  await Listing.findByIdAndUpdate(id , {...req.body.listing});

      if( typeof  req.file !== "undefined"){
       let url = req.file.path;
        let filename = req.file.filename;
        listing.image =  {url , filename};
        await listing.save();
      }
       req.flash("success","Listing Updated!");
     res.redirect(`/listings/${id}`);

};

module.exports.deleteListing = async(req,res) =>{
    let {id} = req.params;
    let deletedId = await Listing.findByIdAndDelete(id);
    console.log(deletedId);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");

};

module.exports.searchListings = async (req, res) => {
    let { q } = req.query;

    if (!q || q.trim() === "") {
        req.flash("error", "Please enter something to search");
        return res.redirect("/listings");
    }

    let allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
        ],
    });

    if (allListings.length === 0) {
        req.flash("error", `No listings found for "${q}"`);
    }

    res.render("lisitngs/index.ejs", { allListings, searchQuery: q });
};
