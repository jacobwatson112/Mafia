import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BroadcastMessage } from '../constants/broadcast.constants';

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  private channel = new BroadcastChannel('game_channel');
  private messageSubject = new Subject<BroadcastMessage>();
  message$ = this.messageSubject.asObservable();

  constructor() {
    this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      this.messageSubject.next(event.data);
    };
  }

  sendMessage(data: BroadcastMessage) {
    this.channel.postMessage(data);
  }
}