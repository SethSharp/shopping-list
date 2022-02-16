import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from "@angular/material/button"
import { MatInputModule } from "@angular/material/input"
import {MatFormFieldModule} from '@angular/material/form-field';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule],
})
export class MaterialModule {}
