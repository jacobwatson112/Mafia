import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { getRole } from '../../helper/roles.helper';
import { Role } from '../../models/role.models';

@Component({
  selector: 'app-display',
  templateUrl: './display.page.html',
  styleUrls: ['./display.page.scss'],
  standalone: false,
})
export class DisplayPage implements OnInit {

  messageType: BroadcastType
  role?: Role
  displayText?: string;

  constructor(
    private broadcastService: BroadcastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.broadcastService.message$.subscribe((msg) => {
      this.messageType = msg.type

      switch (this.messageType) {
        case BroadcastType.Role:
          this.displayRole(msg.role)
          break;
        
        case BroadcastType.Clear:
          this.role = undefined
          this.displayText = undefined
          break;

        case BroadcastType.Text:
          this.displayText = msg.text
          break;

        case BroadcastType.Test:
          //
          break;
      }

      this.cdr.detectChanges();
    });
  }

  displayRole(roleName: RoleType) {
    this.role = getRole(roleName)
  }
}
