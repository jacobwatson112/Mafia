import { Component } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { GameState } from '../../constants/game.constants';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {

  gameState: GameState = GameState.Setup

  constructor(private broadcastService: BroadcastService) {}

  ionViewWillEnter() {
    this.broadcastService.sendMessage({ type: BroadcastType.Clear })
    this.resetGameState()
  }

  resetGameState() {
    this.gameState = GameState.Setup
  }

  onSendTestClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Test })
  }

  onClearScreenClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Clear })
  }

  sendTurn() {
    this.broadcastService.sendMessage({ type: BroadcastType.Role, role: RoleType.Doppelganger });
  }
}
