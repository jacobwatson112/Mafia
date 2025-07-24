import { Component } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { GameState } from '../../constants/game.constants';
import { Card, Role } from '../../models/role.models';
import { getAllRoles, getAllRolesHash } from '../../helper/roles.helper';
import { User } from '../../models/user.models';
import { getAllUsers } from '../../helper/user.helper';
import { addLife, detectUser, findUser, getLivingMafiaNo, getLivingVillagerNo, isUserAlive, removeLife, shuffle } from '../../helper/game.helper';

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

  round: number
  priorityRoles = [RoleType.Doppelganger, RoleType.Mafia, RoleType.Doctor, RoleType.Detective]
  roleIsAwake: boolean;
  selectedUsers: { [roleName: string]: { user1?: string; user2?: string } } = {};

  mafiaAlive: number

  doctorSaved: string;
  mafiaKilled: string;
  sniperShot: string;
  cupidConnected: string[];
  gamblerBet: string;
  guardianAngelSaved: string;
  doppelgangerRole: Role
  taxiDriverBlocks: string;

  get allRolesArray() {
    if (this.allRolesHash) {
      return Object.values(this.allRolesHash);
    }
    return undefined
  }

  get nightRolesArray() {
    if (!this.allRolesHash) return [];

    const roles = Object.values(this.allRolesHash);

    // Customize this array with the role names you want to appear at the top


    return roles.sort((a, b) => {
      const aPriority = this.priorityRoles.indexOf(a.name);
      const bPriority = this.priorityRoles.indexOf(b.name);

      // If both are priority, sort by their order in priorityRoles
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }


  constructor(private broadcastService: BroadcastService) { }

  ionViewWillEnter() {
    this.onClearScreen()
    this.allRolesHash = getAllRolesHash()

    this.mafiaNo = this.allRolesHash[RoleType.Mafia].players
    this.villagerNo = this.allRolesHash[RoleType.Villager].players

    this.users = getAllUsers() || []
    this.totalUsers = this.users.length
    this.initSelectedUsers();

    this.resetGameState()
  }

  resetGameState() {
    this.gameState = GameState.Setup

    for (let user of this.users) {
      user.role = undefined
      user.card = undefined
    }

    this.calculateTotalRoles()
  }

  onSendTestClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Test })
  }

  onSendShuffleClick() {
    this.broadcastService.sendMessage({ type: BroadcastType.Shuffle })
  }

  onClearScreen() {
    this.broadcastService.sendMessage({ type: BroadcastType.Clear })
  }

  initSelectedUsers() {
    if (!this.allRolesArray) return;

    for (const role of this.allRolesArray) {
      if (!this.selectedUsers[role.name]) {
        this.selectedUsers[role.name] = {};
      }
    }
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
  }

  assignRolesAndCards(users: User[], allRoles: Role[]) {
    const assignments: { role: Role, card: Card }[] = [];

    for (const role of allRoles) {
      for (let i = 0; i < role.players; i++) {
        const card = role.cards[i];
        if (!card) {
          throw new Error(`Not enough cards for role: ${role.name}`);
        }
        assignments.push({ role, card });
      }
    }

    const shuffledAssignments = shuffle(assignments);
    if (users.length !== shuffledAssignments.length) {
      throw new Error("Mismatch between users and role assignments");
    }

    users.forEach((user, i) => {
      user.role = shuffledAssignments[i].role;
      user.card = shuffledAssignments[i].card;
      user.lives = 1;
    });
  }

  onRolesSet() {
    this.round = 0
    this.runNight()
  }

  runNight() {
    this.gameState = GameState.Night
    this.round += 1
    this.broadcastService.sendMessage({ type: BroadcastType.Text, text: 'Everyone, Close your eyes' })
    this.roleIsAwake = false
    this.mafiaAlive = getLivingMafiaNo(this.users)

    for (let key in this.allRolesHash) {
      const role = this.allRolesHash[key]
      role.hasWokenUp = false
      if (role.wakeUp && role.firstNightOnly && this.round > 1) {
        role.wakeUp = false
      } else if (role.wakeUp && role.singleActionPerformed) {
        role.wakeUp = false
      }
    }
    
  }

  wakeRole(roleName) {
    this.allRolesHash[roleName].isAwake = true
    this.allRolesHash[roleName].hasWokenUp = true
    this.roleIsAwake = true
    this.broadcastService.sendMessage({ type: BroadcastType.Role, role: roleName })
  }

  sleepRole(roleName) {
    this.allRolesHash[roleName].isAwake = false
    this.roleIsAwake = false
    this.broadcastService.sendMessage({ type: BroadcastType.Text, text: roleName + ' go to sleep 😴' })
  }

  saveTurn(roleName, selected: { user1?: string; user2?: string }) {
    const firstUserName = selected.user1
    const firstUser = findUser(this.users, firstUserName)
    const firstUserText = firstUserName + ' ' + firstUser.role.name
    const secondUserName = selected.user2
    const role = this.allRolesHash[roleName]
    
    //const secondUser = secondUserName ? findUser(this.users, firstUserName) : undefined

    if (role.singleAction) {
      role.singleActionPerformed = true
    }

    switch (roleName) {
      case RoleType.Altruist:
        if (!isUserAlive(this.users, firstUserName)) {
          addLife(this.users, firstUserName)
        }
        break;
      case RoleType.GuardianAngel:
        addLife(this.users, firstUserName)
        this.guardianAngelSaved = firstUserText
        break;
      case RoleType.Doctor:
        addLife(this.users, firstUserName)
        this.doctorSaved = firstUserText
        break;

      case RoleType.Mafia:
        removeLife(this.users, firstUserName, roleName)
        this.mafiaKilled = firstUserText
        break
      case RoleType.Sniper:
        removeLife(this.users, firstUserName, roleName)
        this.sniperShot = firstUserText
        break

      case RoleType.Detective:
        const isMafia = detectUser(this.users, firstUserName)
        this.broadcastService.sendMessage({ type: BroadcastType.Text, text: isMafia ? 'They are Mafia ✅' : 'They arent Mafia ❌' })
        break;
      case RoleType.Clairvoyant:
        if (!isUserAlive(this.users, firstUserName)) {
          this.broadcastService.sendMessage({ type: BroadcastType.Text, text: 'They are a ' + firstUser.role.name })
        }
        break;
      case RoleType.Investigator:
        this.broadcastService.sendMessage({ type: BroadcastType.Text, text: 'They are a ' + firstUser.role.name })
        break;

      case RoleType.Cupid:
        this.cupidConnected = []
        this.cupidConnected.push(firstUserText)
        this.cupidConnected.push(secondUserName)
        break;

      case RoleType.Gambler:
        this.gamblerBet = firstUserText
        break;

      case RoleType.Doppelganger:
        this.doppelgangerRole = firstUser.role
        this.broadcastService.sendMessage({ type: BroadcastType.Doppelganger, role: firstUser.role.name })
        break;

      case RoleType.TaxiDriver:
        this.taxiDriverBlocks = firstUserText
        break;
    }
  }

  calculateResult() {
    this.onClearScreen()

    // Remove Doppelganger from priority list
    if (this.round === 1) {
      const index = this.priorityRoles.findIndex(role => RoleType.Doppelganger);
      if (index !== -1) {
        this.priorityRoles.splice(index, 1);
      }
    }

    const mafiaCurrentlyAlive = getLivingMafiaNo(this.users)
    if (mafiaCurrentlyAlive === 0) {
      // end game
    } else if (mafiaCurrentlyAlive < this.mafiaAlive) {
      // A mafia has died somehow, roll to see if action completed
    }

    // Check if cupid couple are alive
    
    // Check if gambler is alive

    // Check if we need to wake the doppelganger up again

    this.gameState = GameState.Story
  }

  beginTrial() {
    // We want to show a win screen here
    this.checkWinCondition()
    this.gameState = GameState.Trial
  }

  checkWinCondition() {
    const mafiaCurrentlyAlive = getLivingMafiaNo(this.users)
    const villagerCurrentlyAlive = getLivingVillagerNo(this.users)

    if (mafiaCurrentlyAlive === 0) {
      // Villagers win
      this.broadcastService.sendMessage({ type: BroadcastType.Victory, role: RoleType.Villager })
      return true
    }
    if (villagerCurrentlyAlive <= mafiaCurrentlyAlive) {
      // Mafia win
      this.broadcastService.sendMessage({ type: BroadcastType.Victory, role: RoleType.Mafia })
      return true
    }
    return false
  }
}
