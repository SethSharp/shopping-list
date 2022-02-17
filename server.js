
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

// A single recipe
let recipeSchema = {
  title: String,
  items: Array // map now into a object, holding the item, with quantity as value
};
const Recipe = mongoose.model("recipes", recipeSchema)

let inventory = {
  title: String, // stores the same way as recipe items
  quantity: Number
}
const Inventory = mongoose.model("inventory", inventory)

let shoppingList = {
  items: Array // same as Recipe as well
}
const ShoppingList = mongoose.model("list", shoppingList)

app.get("/getItems", (req, res) => {
  Item.find({}, (err, items) => {
    if(err){console.log(err);return;}
    res.json(items)
  })
})

app.get("/getRecipes", (req, res) => {
  Recipe.find({}, (err, items) => {
    if (err) {
      console.log(err);
      return;
    }
    res.json(items);
  });
})

app.get("/getInventory", (req, res) => {
  Inventory.find({}, (err, items) => {
    if (err) {
      console.log(err);
      return;
    }
    res.json(items);
  });
})

app.get("/shoppingList", (req, res) => {
  ShoppingList.find({}, (err, items) => {
    if (err) {
      console.log(err);
      return;
    }
    res.json(items);
  });
})

app.post("/createItem", (req, res) => {
  newItem.save().then((item) => {res.json(item);}).catch((err) => console.log(err));
});

app.post("/createRecipe", (req, res) => {
  newRecipe = new Recipe({ title: req.body.title, items: req.body.items });
  newRecipe
    .save()
    .then((recipe) => {
      console.log(recipe, " created successfully")
      res.json(recipe);
    })
    .catch((err) => console.log(err));
});

app.post("/addInventory", (req, res) => {
  newInvent = new Inventory({title:req.body.title, quantity:req.body.quantity})
  newInvent.save().then((item) => {
    res.json(item)
  }).catch(e=>console.log(e))
})

app.post("/addShoppingList", (req, res) => {

})

app.listen(port, () => {
  console.log("Listening on port:", port);
});


