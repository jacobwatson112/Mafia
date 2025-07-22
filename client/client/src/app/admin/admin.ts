import { Component } from '@angular/core';
import { Websocket } from '../websocket';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  constructor(private ws: Websocket) {}

  ngOnInit() {
    this.ws.connect('admin');
  }

  startGame() {
    this.ws.send('start_game', { round: 1 }, ['display']);
  }
}