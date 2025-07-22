import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Websocket {
  private socket!: WebSocket;
  private role!: string;

  connect(role: string) {
    this.role = role;
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.onopen = () => {
      this.send('register', {}, []);
    };
  }

  send(type: string, payload: any, targetRoles: string[] = []) {
    const message = {
      type,
      payload,
      senderRole: this.role,
      targetRoles
    };
    this.socket.send(JSON.stringify(message));
  }

  onMessage(callback: (msg: any) => void) {
    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      callback(msg);
    };
  }
}
