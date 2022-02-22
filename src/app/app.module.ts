import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module'; // needs to be undert a material folder => doesnt like it
import { ReactiveFormsModule } from '@angular/forms'; // doesnt know what certain paramters are like [formGroup]
import { HttpClientModule } from '@angular/common/http';
import { FilterItemsPipe } from './filter-items.pipe'; // if not imported, error => No HTML
import { FormsModule } from '@angular/forms'; // fixed ngModel not binding to input, gives that ability

@NgModule({
  declarations: [AppComponent, FilterItemsPipe],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
