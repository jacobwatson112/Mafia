import { Component } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { GameState } from '../../constants/game.constants';
import { Card, Role } from '../../models/role.models';
import { getAllRoles, getAllRolesHash } from '../../helper/roles.helper';
import { User } from '../../models/user.models';
import { getAllUsers } from '../../helper/user.helper';
import { shuffle } from '../../helper/game.helper';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {

  gameState: GameState = GameState.Setup
  error: string

  allRolesHash: Role[]
  users: User[]

  totalRoles: number;
  totalUsers: number;

  mafiaNo: number;
  villagerNo: number;

  newUserName: string

  get allRolesArray() {
    if (this.allRolesHash) {
      return Object.values(this.allRolesHash);
    }
    return undefined
  }


  constructor(private broadcastService: BroadcastService) { }

  ionViewWillEnter() {
    this.broadcastService.sendMessage({ type: BroadcastType.Clear })
    this.allRolesHash = getAllRolesHash()

    this.mafiaNo = this.allRolesHash[RoleType.Mafia].players
    this.villagerNo = this.allRolesHash[RoleType.Villager].players

    this.users = getAllUsers() || []
    this.totalUsers = this.users.length

    this.resetGameState()
  }

  resetGameState() {
    this.gameState = GameState.Setup

    for (let user of this.users) {
      user.role = undefined
      user.card = undefined
    }

    this.calculateTotalRoles()
    console.log(this.allRolesHash)
  }

  onSendTestClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Test })
  }

  onSendShuffleClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Shuffle })
  }

  onClearScreenClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Clear })
  }

  calculateTotalRoles() {
    let total = 0
    for (let key in this.allRolesHash) {
      total += this.allRolesHash[key].players
    }
    this.totalRoles = total
  }

  onChangePlayerNo(value: number, roleName: string) {
    this.allRolesHash[roleName].players = value
    this.calculateTotalRoles()
  }

  roleClick(roleName: string) {
    const role = this.allRolesHash[roleName]

    switch (roleName) {
      case RoleType.Mafia:
      case RoleType.Villager:
        return

      case RoleType.Masons:
        role.players = role.players === 2 ? 0 : 2
        break;

      default:
        role.players = role.players === 1 ? 0 : 1
    }

    this.calculateTotalRoles()
  }

  addUser() {
    // Add something so users cant have the same name (maybe an id)
    if (!this.newUserName) {
      return
    }
    const newUser: User = {
      name: this.newUserName,
    }
    this.users.push(newUser)
    this.newUserName = undefined
    this.totalUsers = this.users.length
  }

  deleteUser(userName: string) {
    const index = this.users.findIndex(user => user.name === userName);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
    this.totalUsers = this.users.length
  }

  onStartClick() {
    if (this.totalRoles !== this.totalUsers) {
      this.error = 'Player count and Role count dont match :/'
      return
    }
    this.error = undefined
    this.gameState = GameState.SetRoles
    this.broadcastService.sendMessage({ type: BroadcastType.Shuffle })

    const allRoles = []
    for (let key in this.allRolesHash) {
      allRoles.push(this.allRolesHash[key])
    }
    
    this.assignRolesAndCards(this.users, allRoles)

    console.log(this.users)
  }

  assignRolesAndCards(users: User[], allRoles: Role[]) {
    const assignments: { role: Role, card: Card }[] = [];

    // 1. Build role-card pairs
    for (const role of allRoles) {
      for (let i = 0; i < role.players; i++) {
        const card = role.cards[i];
        if (!card) {
          throw new Error(`Not enough cards for role: ${role.name}`);
        }
        assignments.push({ role, card });
      }
    }

    // 2. Shuffle role-card assignments (but not users)
    const shuffledAssignments = shuffle(assignments);

    // 3. Assign shuffled roles and cards to users in fixed order
    if (users.length !== shuffledAssignments.length) {
      throw new Error("Mismatch between users and role assignments");
    }

    users.forEach((user, i) => {
      user.role = shuffledAssignments[i].role;
      user.card = shuffledAssignments[i].card;
    });
  }

  onRolesSet() {

  }
}
