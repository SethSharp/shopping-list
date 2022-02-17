import { Component } from '@angular/core';
import { Form, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MongooseService } from './services/mongoose.service';

export interface Recipes {
  name: string;
  requested: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
@Injectable({
  providedIn: 'root',
})
export class AppComponent {
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private mongoose: MongooseService
  ) {}
  ngOnInit(): void {
    this.mongoose.getAllItems().subscribe((items) => {
      this.items = items;
    });
    this.mongoose.getAllInventory().subscribe((inventoryArray:any) => {
      let inventoryMap = new Map()
      for (const item of inventoryArray) {
        inventoryMap.set(item.title, item.quantity)
      }
      this.inventory = inventoryMap
    })
    this.mongoose.getAllRecipes().subscribe((recipeItems) => {
      this.recipes = recipeItems
      console.log(this.recipes)
    })
  }

  uri = 'http://localhost:4000';
  table = 'items';

  // Holds local mongoose data
  items: any;
  shoppingList: any;
  inventory:any;
  recipes:any;

  checkoutForm = this.formBuilder.group({
    item: '',
  });

  recipeItemForm = this.formBuilder.group({
    title: '',
    quantity: 0,
  });

  recipeForm = this.formBuilder.group({
    title: '',
  });

  inventoryForm = this.formBuilder.group({
    title: '',
    quantity: 0,
  });

  // Need to have a map to store items and that
  // Easy indexing to find quantity ["item"]
  recipeSchema = {
    title: '',
    items: new Map(),
  };

  submitItem(): any {
    // Process checkout data here
    this.http
      .post(`${this.uri}/createItem`, {
        item: this.checkoutForm.controls['item'].value,
      })
      .subscribe((itemData) => {
        console.log (itemData)
      });
  }

  submitRecipeItem() {
    this.recipeSchema.items.set(
      this.recipeItemForm.controls['title'].value,
      this.recipeItemForm.controls['quantity'].value
    );
    console.log(this.recipeSchema);
    this.recipeItemForm.reset();
  }
  submitRecipe() {
    this.recipeSchema.title = this.recipeForm.controls['title'].value;
    // TS cannot be used directly inside a http post body
    let convMap: { [key: string]: number } = {};
    this.recipeSchema.items.forEach((val: number, key: string) => {
      convMap[key] = val;
    });
    this.http
      .post(`${this.uri}/createRecipe`, {
        title: this.recipeSchema.title,
        items: convMap,
      })
      .subscribe((recipe: any) => {
        this.recipes.push(recipe)
        this.recipeForm.reset()
        this.recipeSchema.items = new Map()
      });
  }


  submitItemToInventory() {
    if (this.itemInInventory(this.inventoryForm.controls["title"].value)) {
      return
    }
    this.mongoose.addItemToInventory(
      this.inventoryForm.controls["title"].value,
      this.inventoryForm.controls["quantity"].value
      ).subscribe((item:any) => {
        console.log("...did add")
        this.inventory = [...this.inventory, {title:item.title, quantity:item.quantity}];

    })
  }

  itemInInventory(itemTitle:string) : Boolean{
    console.log(this.inventory)
    for (let item of this.inventory) {
      console.log(item.title)
      if (item.title == itemTitle) {
        return true;
      }
    }
    return false
  }


  allRecipes:any = []; // Array holding all the recipes the user wants for the week
  // Add recipe[i] to allRecipes
  saveRecipes(i:number, b:boolean) {
    if(!b) { // basically, if unchecked, we remove item
      if (this.recipes.length-1==i) {
        // splice doesn't work on last element
        this.allRecipes.pop();
        return;
      }
      this.allRecipes.splice(i,1)
      return
    }
    this.allRecipes.push(this.recipes[i])
  }
  calculateShoppingList() {
    /*
      1. Get all ingredients from recipes
      2. Comparing with the inventory, make a new local copy to edit the data
      3. Create some logic to determine what i need to buy and display
      4. Need some sort of confirmation, which will set my inventory to what
         I have bought and update it
      NOTE: Inventory will basically keep track of every piece of food I should have
            So if i have some missing then i know someone took something... but also
            to not have to continuously update the inventory every week
            This is why this app is going to be amazing, i just have to select what
            i want to eat for the week and it tells me what i need to buy
      5. Further down the track can even add in rough costs for each item and have a predicted
         total cost for the week
    */

    // Calcs all ingredients from the recipe list
    let savedRecipeItems = new Map() // holds map of items
    for (let r of this.allRecipes) {
      //let item of recipe.items
      for(let item of r.items) {
        for (const [key, value] of Object.entries(item)) {
          savedRecipeItems.set(key, value)
        }
      }
    }

    let copyInventory = [...this.inventory];
    let temporaryShoppingList = new Map()
    for (let [key, value] of savedRecipeItems) {
      // go through each item and see if there is enoguh in our invenogtry
      let cAmount = this.inventory.get(key)
      let nAmount = savedRecipeItems.get(key)
      if (cAmount < nAmount) {
        let amount = nAmount-cAmount
        if (temporaryShoppingList.has(key)) {
          // then we need even more of said item(key)
          let pAmount = temporaryShoppingList.get(key)
          let newAmount = pAmount + amount
          temporaryShoppingList.set(key, newAmount)
          continue;
        }
        // otherwise, we just need to set the item value
        temporaryShoppingList.set(key, amount)
      }
    }

    if (temporaryShoppingList.size!=0) {
      this.shoppingList=temporaryShoppingList
    }

  }
}
