import { Component } from '@angular/core';
import { Form, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
@Injectable({
  providedIn: 'root',
})
export class AppComponent {
  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  uri = 'http://localhost:4000';
  table = 'items';

  checkoutForm = this.formBuilder.group({
    item: '',
  });

  submitForm(): any {
    // Process checkout data here
    this.http
      .post(`${this.uri}/createItem`, {
        item: this.checkoutForm.controls['item'].value,
      })
      .subscribe((itemData) => {});
  }
}
