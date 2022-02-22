import { FilterItemsPipe } from './filter-items.pipe';
import { Component } from '@angular/core';
import { Form, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MongooseService } from './services/mongoose.service';

export interface Recipes {
  name: string;
  requested: boolean;
}
export interface Item {
  item: string
}

export interface Inventory {
  item: string,
  quantity: number
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
    this.mongoose.getAllItems().subscribe((items:any) => {
      this.items = this.convertMongooseItems(items);
    });
    this.mongoose.getAllInventory().subscribe((inventoryArray:any) => {
      let inventoryMap = new Map()
      for (const item of inventoryArray) {
        inventoryMap.set(item.title, item.quantity)
      }
      this.inventory = inventoryMap
      console.log(this.inventory);
    })
    this.mongoose.getAllRecipes().subscribe((recipeItems) => {
      this.recipes = recipeItems
    })
  }

  convertMongooseItems(items:any[]):Item[] {
    let newItems: Item[]=items.map((item) => item.item)
    return newItems
  }

  uri = 'http://localhost:4000';
  table = 'items';
  search=""

  // Holds local mongoose data
  items: any=[];
  shoppingList: any;
  inventory = new Map();
  recipes:any;

  itemForm = this.formBuilder.group({
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
    let newItem = this.itemForm.controls['item'].value;
    let itemExists = this.items.filter((it: string) => it == newItem);
    if (itemExists.length==1){alert("Item exists");return}
    this.http.post(`${this.uri}/createItem`, {
        item: newItem,
      })
      .subscribe((item: any) => {
        this.items = [...this.items, item.item];
        this.itemForm.reset();
      });
  }

  submitRecipeItem() {
    this.recipeSchema.items.set(
      this.recipeItemForm.controls['title'].value,
      this.recipeItemForm.controls['quantity'].value
    );
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
    let item = this.inventoryForm.controls['title'].value;
    let quantity = this.inventoryForm.controls["quantity"].value
    if (this.itemInInventory(item)) {
      let oldAmount = this.inventory.get(item)
      this.mongoose.updateItemQuantity(item, quantity, oldAmount).subscribe((x:any)=> {
        if (x) {

          this.inventory.set(item, oldAmount+quantity)
        }
      })
      return
    }
    this.mongoose.addItemToInventory(item,quantity).subscribe((item:any) => {
        this.inventory.set(item.title, item.quantity)
        this.inventoryForm.reset()
      })
  }

  itemInInventory(itemTitle:string) : Boolean{
    return  this.inventory.get(itemTitle)
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
          if (savedRecipeItems.has(key)) {
            // then we need even more of said item(key)
            console.log('Hmm yes');
            let pAmount = savedRecipeItems.get(key);
            let newAmount = pAmount + value;
            savedRecipeItems.set(key, newAmount);
            continue;
          }
          savedRecipeItems.set(key, value)
        }
      }
    }

    let temporaryShoppingList = new Map()
    for (let [key, value] of savedRecipeItems) {
      // go through each item and see if there is enoguh in our invenogtry
      let cAmount = this.inventory.get(key)
      let nAmount = savedRecipeItems.get(key)
      if (cAmount < nAmount) {
        let amount = nAmount-cAmount
        temporaryShoppingList.set(key, amount)
      }
    }

    if (temporaryShoppingList.size!=0) {
      this.shoppingList=temporaryShoppingList
    }

  }

  isChecked = false
  isCheckedName = ""
  handleItemCheckbox(event:any) {
    this.isChecked = !this.isChecked;
    this.isCheckedName = event.target.name;
    console.log(this.isCheckedName)
  }
}
