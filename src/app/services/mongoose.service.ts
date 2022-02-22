import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})

// Easy access service to retrieve mongoose Data
export class MongooseService {
  constructor(private http: HttpClient) {}

  uri = 'http://localhost:4000';

  getAllItems():any {
    return this.http.get(`${this.uri}/getItems`);
  }

  getAllInventory() {
    return this.http.get(`${this.uri}/getInventory`);
  }

  getAllRecipes() {
    return this.http.get(`${this.uri}/getRecipes`)
  }

  addItemToInventory(title: any, quantity: any) {
    return this.http.post(`${this.uri}/addInventory`, {
      title: title,
      quantity: quantity,
    });
  }

  updateItemQuantity(title:string, quantity:number, oldAmount:number) {
    return this.http.post(`${this.uri}/updateInventoryItem`, {
      title: title,
      quantity: quantity,
      oldAmount: oldAmount
    });
  }
}
