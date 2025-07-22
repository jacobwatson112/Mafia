import { Component } from '@angular/core';
import { Websocket } from '../websocket';

@Component({
  selector: 'app-display',
  imports: [],
  templateUrl: './display.html',
  styleUrl: './display.css'
})
export class Display {
  constructor(private ws: Websocket) {}

  ngOnInit() {
    this.ws.connect('display');
    this.ws.onMessage((msg) => {
      if (msg.type === 'start_game') {
        console.log('Game started on display:', msg.payload);
      }
    });
  }
}