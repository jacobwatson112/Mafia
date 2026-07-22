import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { getAllRoles, getRole } from '../../helper/roles.helper';
import { RoleDefinition } from '../../models/role.models';

@Component({
  selector: 'app-display',
  templateUrl: './display.page.html',
  styleUrls: ['./display.page.scss'],
  standalone: false,
})
export class DisplayPage implements OnInit, OnDestroy {
  messageType?: BroadcastType;
  role?: RoleDefinition;
  allRoles: RoleDefinition[] = [];
  intervalId?: ReturnType<typeof setInterval>;
  currentRoleIndex = 0;
  displayText?: string;
  winningRole?: RoleType;

  private messageSub?: Subscription;

  constructor(
    private broadcastService: BroadcastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ionViewWillEnter() {
    this.allRoles = getAllRoles();
  }

  ngOnInit() {
    this.messageSub = this.broadcastService.message$.subscribe((msg) => {
      this.messageType = msg.type;
      this.clearRoleCycle();

      switch (msg.type) {
        case BroadcastType.Role:
          this.displayRole(msg.role);
          break;

        case BroadcastType.Clear:
          this.role = undefined;
          this.displayText = undefined;
          this.winningRole = undefined;
          break;

        case BroadcastType.Text:
          this.displayText = msg.text;
          break;

        case BroadcastType.Shuffle:
          this.startRoleCycle();
          break;

        case BroadcastType.Test:
          break;

        case BroadcastType.Doppelganger:
          this.displayDoppelgangerRole(msg.role);
          break;

        case BroadcastType.Victory:
          this.winningRole = msg.role;
          break;
      }

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.clearRoleCycle();
    this.messageSub?.unsubscribe();
  }

  displayRole(roleName: RoleType) {
    this.role = getRole(roleName);
  }

  displayDoppelgangerRole(roleName: RoleType) {
    const doppelgangerRole = getRole(RoleType.Doppelganger);
    const role = getRole(roleName);

    if (!doppelgangerRole || !role) {
      return;
    }

    this.role = role;
    this.role.cards = doppelgangerRole.cards;
  }

  startRoleCycle() {
    if (!this.allRoles.length) {
      this.allRoles = getAllRoles();
    }
    if (!this.allRoles.length) {
      return;
    }

    this.currentRoleIndex = 0;
    this.role = this.allRoles[this.currentRoleIndex];

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.currentRoleIndex = (this.currentRoleIndex + 1) % this.allRoles.length;

        this.ngZone.run(() => {
          this.role = this.allRoles[this.currentRoleIndex];
        });
      }, 5000);
    });
  }

  private clearRoleCycle() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}