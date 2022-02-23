import { FilterItemsPipe } from './filter-items.pipe';
import { Component } from '@angular/core';
import { Form, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MongooseService } from './services/mongoose.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private mongoose: MongooseService,
    private _snackBar: MatSnackBar
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
  shoppingList = new Map<string, number>(); // allows use for name and quantity
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

  matSnackAlert(msg:string, duration:number) {
    this._snackBar.open(msg, "x" , {
      "duration":duration,
      "verticalPosition":"top"
    })
  }

  submitItem(): any {
    // Process checkout data here
    let newItem = this.itemForm.controls['item'].value;
    if (newItem=="") {
      this.matSnackAlert('Need a title for this item', 2000);
      return
    }
    let itemExists = this.items.filter((it: string) => it == newItem);
    if (itemExists.length==1){
      this.matSnackAlert('Item already exists', 2000);
      this.itemForm.reset();
      return
    }
    this.http.post(`${this.uri}/createItem`, {item: newItem,}).subscribe((item: any) => {
        this.items = [...this.items, item.item];
        this.itemForm.reset();
        this.matSnackAlert("Item added successfuly", 2000)
      });
  }

  submitRecipeItem() {
    let title = this.recipeItemForm.controls['title'].value
    let quantity = this.recipeItemForm.controls['quantity'].value
    if (!title || !quantity) {
      this.matSnackAlert('Complete item form', 2000);
      return
    }
    this.recipeSchema.items.set(title,quantity);
    this.recipeItemForm.reset();
    this.isChecked=false
    this.matSnackAlert('Recipe item added successfuly', 1000);
  }

  submitRecipe() {
    this.recipeSchema.title = this.recipeForm.controls['title'].value;
    if(this.recipeSchema.title == "") {
      this.matSnackAlert('Need title for that recipe', 2000)
      return
    }
    if (this.recipeSchema.items.size==0) {
      this.matSnackAlert("Need at least 1 item for this recipe", 2000);
      return
    }
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
        this.recipes=[...this.recipes,recipe]
        this.recipeForm.reset()
        this.recipeSchema.items = new Map()
        this.matSnackAlert('Recipe added successfuly', 2000);
      });
  }


  submitItemToInventory() {
    let item = this.inventoryForm.controls['title'].value;
    let quantity = this.inventoryForm.controls["quantity"].value
    if (this.itemInInventory(item)) {
      let oldAmount = this.inventory.get(item)
      this.mongoose.updateItemQuantity(item, quantity, oldAmount).subscribe((x:any)=> {
        if (x) {
          this.matSnackAlert('Added new amount of item to inventory', 1500);
          this.inventory.set(item, oldAmount+quantity)
        }
      })
      return
    }
    this.mongoose.addItemToInventory(item,quantity).subscribe((item:any) => {
        this.inventory.set(item.title, item.quantity)
        this.inventoryForm.reset()
        this.matSnackAlert('Item added to inventory successfuly', 1500);
      })
  }

  itemInInventory(itemTitle:string) : Boolean{
    return  this.inventory.get(itemTitle)
  }


  allRecipes:any[] = []; // Array holding all the recipes the user wants for the week
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
    if (this.allRecipes.length==0) {
      this.matSnackAlert('Week is empty', 1500);
      return
    }
    this.matSnackAlert('Calculating shopping list', 1500);
    // Calcs all ingredients from the recipe list
    let savedRecipeItems = new Map() // holds map of items
    for (let r of this.allRecipes) {
      //let item of recipe.items
      console.log(r)
      for (const [key, value] of Object.entries(r.items)) {
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
    for (let [key, nAmount] of savedRecipeItems) {
      // go through each item and see if there is enoguh in our invenogtry
      let cAmount = this.inventory.get(key)
      if (cAmount < nAmount) {
        let amount = nAmount-cAmount
        this.shoppingList.set(key,amount)
      }
    }

    // may just go through our list, if those items are in the shopping list, update
    // else we add to shopping list (No temporary)


  }

  isChecked = false
  isCheckedName = ""
  handleItemCheckbox(event:any) {
    this.isChecked = !this.isChecked;
    this.isCheckedName = event.target.name;
  }
}
