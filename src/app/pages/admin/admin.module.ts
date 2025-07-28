import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AdminPage } from './admin.page';
import { ComponentsModule } from "../../components/components.module";

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
],
  declarations: [AdminPage],
})
export class AdminPageModule {}
