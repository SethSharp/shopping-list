
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

let cors = require("cors");
let port = 4000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/shoppingList", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Connnected to database"));

let itemSchema = {
  item:String
};

const Item = mongoose.model("items", itemSchema);

app.post("/createItem", (req, res) => {
  newItem = new Item(req.body)
  newItem.save().then((item) => {
    console.log(item, " added Successfully")
    res.json(item)
  }).catch((err) => console.log(err))
})

app.listen(port, () => {
  console.log("Listening on port:", port);
});


