import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from "@angular/material/button"
import { MatInputModule } from "@angular/material/input"
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from "@angular/material/select"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatGridListModule } from "@angular/material/grid-list"
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatExpansionModule } from '@angular/material/expansion';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatGridListModule,
    ScrollingModule,
    MatExpansionModule
  ],
})
export class MaterialModule {}
