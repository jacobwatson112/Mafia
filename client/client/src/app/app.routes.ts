import { Routes } from '@angular/router';
import { Admin } from './admin/admin';
import { Display } from './display/display';
import { Player } from './player/player';

export const routes: Routes = [
  { path: 'admin', component: Admin },
  { path: 'display', component: Display },
  { path: 'player', component: Player },
  { path: '**', redirectTo: 'admin' }
];
