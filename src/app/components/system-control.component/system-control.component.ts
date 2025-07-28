import { Component, Input } from '@angular/core';
import { User } from '../../models/user.models';
import { BroadcastType } from '../../constants/broadcast.constants';
import { BroadcastService } from '../../services/broadcast.service';

@Component({
  selector: 'comp-system-control',
  templateUrl: './system-control.component.html',
  styleUrls: ['./system-control.component.scss'],
  standalone: false,
})

export class SystemControlComponent {
    @Input() users: User[]

    expand: boolean = false

    constructor(
        private broadcastService: BroadcastService
    ) {}

    ionViewWillEnter() {
      this.expand = false
    }

    onExpandButtonClick() {
      this.expand = !this.expand
    }

    onSendTestClick() {
        this.broadcastService.sendMessage({ type: BroadcastType.Test });
      }
    
      onSendShuffleClick() {
        this.broadcastService.sendMessage({ type: BroadcastType.Shuffle });
      }
    
      onClearScreen() {
        this.broadcastService.sendMessage({ type: BroadcastType.Clear });
      }

}