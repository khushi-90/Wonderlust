const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
.then(() =>{
    console.log("connected to DB");
})
.catch((err) =>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () =>{
    await Listing.deleteMany({});
      initData.data = initData.data.map((obj) =>
         ({...obj ,
             owner: "6aa90ff4f4e838f96bdd9a2d",
            }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();