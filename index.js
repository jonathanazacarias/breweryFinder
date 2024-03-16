import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import "dotenv/config";
import base64js from "base64-js";

import { Buffer } from "node:buffer";

import fs from "node:fs";

const app = express();
const port = process.env.DEV_PORT;
const HERE_API_key = process.env.HERE_MAPS_API_KEY;
const hereAPIBaseUrl = "https://image.maps.hereapi.com/mia/v3/base/mc/";
const openBreweryAPIBaseUrl = "https://api.openbrewerydb.org/v1/breweries/";
const homePageBreweries = 6;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    // load the home page with 6 random initial brewery and map
    var breweryList = [];
    for (let i = 0; i < homePageBreweries; i++) {
      var response = await axios.get(openBreweryAPIBaseUrl + "random");
      var singleBrewery = response.data[0];
      breweryList.push(singleBrewery);
    }

    // get the latitude and longitude of each brewery to pass to HERE API
    for (let i = 0; i < 1; i++) {
      // some breweries in open brewery db dont have location data so only make
      // the req if there is.
      if (breweryList[i].latitude && breweryList[i].longitude) {
        var brewery = breweryList[i];
        var breweryLat = brewery.latitude;
        var breweryLong = brewery.longitude;

        // create and make the map request
        var hereApiReq =
          hereAPIBaseUrl +
          "center:" +
          breweryLat +
          "," +
          breweryLong +
          ";zoom=10/500x250/png?apiKey=" +
          HERE_API_key;
        var breweryMap = await axios.get(hereApiReq);

        // // convert the raw data to base-64
        var png = base64js.fromByteArray(breweryMap.data);
        console.log(png);

        // fs.writeFile("map.bin", breweryMap.data, (err) => {
        //   if (err) console.log(`error`);
        //   console.log("The file has been saved!");
        // });

        // add the map to the brewery
        brewery["breweryMap"] = png;
      }
    }

    res.render("index.ejs", { data: breweryList });
  } catch (error) {
    // console.log(error.response.data.message);
    // res.render("index.ejs", { error: error.response.data.message })
    console.log(`error`);;
  }
});

app.post("", (req, res) => {

});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});

// Example response from open brewery
// [
//   {
//     id: "bd119567-1524-49cd-a608-4b15f885a7f7",
//     name: "No Clue Craft Brewery",
//     brewery_type: "micro",
//     address_1: "9037 Arrow Rte Ste 170",
//     address_2: null,
//     address_3: null,
//     city: "Rancho Cucamonga",
//     state_province: "California",
//     postal_code: "91730-4433",
//     country: "United States",
//     longitude: "-117.5410707",
//     latitude: "34.0990988",
//     phone: "9099892394",
//     website_url: "http://www.nocluebrew.com",
//     state: "California",
//     street: "9037 Arrow Rte Ste 170",
//   },
// ];
