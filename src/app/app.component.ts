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
    console.log('sss');
    this.mongoose.getAllItems().subscribe((items) => {
      this.items = items;
      console.log(this.items);
    });
  }
  uri = 'http://localhost:4000';
  table = 'items';

  // Holds local mongoose data
  items: any;
  shoppingList: any;
  inventory: { [key: string]: number } = {};
  recipes = ["Recipe 1", "Recipe 2"]

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
      .subscribe((itemData) => {});
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
        let x = recipe.items;
        for (const obj in x[0]) {
          console.log(x[0][obj]);
        }
      });
  }

  submitItemToInventory() {
    this.mongoose.addItemToInventory(
      this.inventoryForm.controls["title"].value,
      this.inventoryForm.controls["quantity"].value
      ).subscribe((item:any) => {
      this.inventory[item.title] = item.quantity
    })
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
  }
}
