import { Component } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {
  constructor(private broadcastService: BroadcastService) {}

  sendTurn() {
    this.broadcastService.sendMessage({ type: BroadcastType.Role, role: 'Alice' });
  }
}
