import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { getAllRoles, getRole } from '../../helper/roles.helper';
import { Role } from '../../models/role.models';
import _ from 'lodash'

@Component({
  selector: 'app-display',
  templateUrl: './display.page.html',
  styleUrls: ['./display.page.scss'],
  standalone: false,
})
export class DisplayPage implements OnInit {

  messageType: BroadcastType
  role: Role
  allRoles: Role[]
  intervalId: any;
  currentRoleIndex = 0;
  displayText: string;
  winningRole: string

  constructor(
    private broadcastService: BroadcastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ionViewWillEnter() {
    this.allRoles = getAllRoles()
  }

  ngOnInit() {
    this.broadcastService.message$.subscribe((msg) => {
      this.messageType = msg.type
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      switch (this.messageType) {
        case BroadcastType.Role:
          this.displayRole(msg.role)
          break;

        case BroadcastType.Clear:
          this.role = undefined
          this.displayText = undefined
          this.winningRole = undefined
          break;

        case BroadcastType.Text:
          this.displayText = msg.text
          break;

        case BroadcastType.Shuffle:
          this.startRoleCycle()
          break;

        case BroadcastType.Test:
          //
          break;

        case BroadcastType.Doppelganger:
          this.displayDoppelgangerRole(msg.role)
          break;

        case BroadcastType.Victory:
          this.winningRole = msg.role
          break;
      }

      this.cdr.detectChanges();
    });
  }

  displayRole(roleName: RoleType) {
    this.role = getRole(roleName)
  }

  displayDoppelgangerRole(roleName: RoleType) {
    const doppelgangerRole = getRole(RoleType.Doppelganger)
    this.role = getRole(roleName)
    this.role.cards = doppelgangerRole.cards
  }

  startRoleCycle() {
    if (!this.allRoles || this.allRoles.length === 0) {
      this.allRoles = getAllRoles();
    }

    this.currentRoleIndex = 0;
    this.role = this.allRoles[this.currentRoleIndex];

    // Run interval *outside* Angular to avoid triggering change detection too often
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.currentRoleIndex = (this.currentRoleIndex + 1) % this.allRoles.length;

        // Re-enter Angular zone to update UI safely
        this.ngZone.run(() => {
          this.role = this.allRoles[this.currentRoleIndex];
          // No need to call detectChanges() explicitly here!
        });
      }, 10000);
    });
  }
}
