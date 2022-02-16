import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})

// Easy access service to retrieve mongoose Data
export class MongooseService {
  constructor(private http: HttpClient) {}

  uri = 'http://localhost:4000';

  getAllItems() {
    return this.http.get(`${this.uri}/getItems`);
  }

  addItemToInventory(title:any, quantity:any) {
    return this.http.post(`${this.uri}/addInventory`,{title:title,quantity:quantity})
  }
}
