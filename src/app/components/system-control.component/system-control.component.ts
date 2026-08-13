import { Component, Input } from '@angular/core';
import { User } from '../../models/user.models';
import { BroadcastType } from '../../constants/broadcast.constants';
import { BroadcastService } from '../../services/broadcast.service';
import { RoleType } from '../../constants/role.constants';
import { getAllRoles } from '../../helper/roles.helper';

@Component({
  selector: 'comp-system-control',
  templateUrl: './system-control.component.html',
  styleUrls: ['./system-control.component.scss'],
  standalone: false,
})

export class SystemControlComponent {
    @Input() users: User[]

    expand: boolean = false
  roleOverviewOptions: RoleType[] = [];
  selectedRoleOverview?: RoleType;

    constructor(
        private broadcastService: BroadcastService
  ) {
      this.roleOverviewOptions = getAllRoles().map((role) => role.name);
      this.selectedRoleOverview = this.roleOverviewOptions[0];
  }

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

      onShowRoleOverviewClick() {
        if (!this.selectedRoleOverview) {
          return;
        }
        this.broadcastService.sendMessage({ type: BroadcastType.Clear });
        this.broadcastService.sendMessage({
          type: BroadcastType.Role,
          role: this.selectedRoleOverview,
        });
      }

}