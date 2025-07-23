// src/app/broadcast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  private channel = new BroadcastChannel('game_channel');
  private messageSubject = new Subject<any>();
  message$ = this.messageSubject.asObservable();

  constructor() {
    this.channel.onmessage = (event) => {
      this.messageSubject.next(event.data);
    };
  }

  sendMessage(data: any) {
    this.channel.postMessage(data);
  }
}
