import { Component } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { GameState } from '../../constants/game.constants';
import { Card, Role } from '../../models/role.models';
import { getAllRoles, getAllRolesHash } from '../../helper/roles.helper';
import { User } from '../../models/user.models';
import { getAllUsers } from '../../helper/user.helper';
import {
  addLife,
  detectUser,
  findUser,
  getLivingMafiaNo,
  getLivingVillagerNo,
  getUsersWithRole,
  isUserAlive,
  removeLife,
  removeLifeFromUser,
  shuffle
} from '../../helper/game.helper';
import _, { find } from 'lodash';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {
  gameState: GameState = GameState.Setup;
  error: string;

  allRolesHash: Role[];
  users: User[];
  postNightUsers: User[];

  totalRoles: number;
  totalUsers: number;

  mafiaNo: number;
  villagerNo: number;

  newUserName: string;

  round: number;
  priorityRoles = [
    RoleType.Doppelganger,
    RoleType.Mafia,
    RoleType.Doctor,
    RoleType.Detective,
  ];
  roleIsAwake: boolean;
  selectedUsers: { [roleName: string]: { user1?: string; user2?: string } } =
    {};

  mafiaAlive: number;

  altruistResurrected: string
  doctorSaved: string;
  mafiaKilled: string;
  sniperShot: string;
  cupidConnected: string[];
  gamblerBet: string;
  gamblerAlive: boolean;
  gamblerName: string;
  guardianAngelSaved: string;
  doppelgangerRole: Role;
  doppelgangerAction: string;
  taxiDriverBlocks: string;

  mayorUser: User;
  votedUser: string;

  get allRolesArray() {
    if (this.allRolesHash) {
      return Object.values(this.allRolesHash);
    }
    return undefined;
  }

  get nightRolesArray() {
    if (!this.allRolesHash) return [];

    const roles = Object.values(this.allRolesHash);

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
    this.onClearScreen();
    this.allRolesHash = getAllRolesHash();

    this.mafiaNo = this.allRolesHash[RoleType.Mafia].players;
    this.villagerNo = this.allRolesHash[RoleType.Villager].players;

    this.users = getAllUsers() || [];
    this.totalUsers = this.users.length;
    this.initSelectedUsers();

    this.resetGameState();
  }

  resetGameState() {
    this.gameState = GameState.Setup;

    for (let user of this.users) {
      user.role = undefined;
      user.card = undefined;
    }

    this.calculateTotalRoles();
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

  initSelectedUsers() {
    if (!this.allRolesArray) return;

    for (const role of this.allRolesArray) {
      if (!this.selectedUsers[role.name]) {
        this.selectedUsers[role.name] = {};
      }
    }
  }

  calculateTotalRoles() {
    let total = 0;
    for (let key in this.allRolesHash) {
      total += this.allRolesHash[key].players;
    }
    this.totalRoles = total;
  }

  onChangePlayerNo(value: number, roleName: string) {
    this.allRolesHash[roleName].players = value;
    this.calculateTotalRoles();
  }

  roleClick(roleName: string) {
    const role = this.allRolesHash[roleName];

    switch (roleName) {
      case RoleType.Mafia:
      case RoleType.Villager:
        return;

      case RoleType.Masons:
        role.players = role.players === 2 ? 0 : 2;
        break;

      default:
        role.players = role.players === 1 ? 0 : 1;
    }

    this.calculateTotalRoles();
  }

  addUser() {
    // Add something so users cant have the same name (maybe an id)
    if (!this.newUserName) {
      return;
    }
    const newUser: User = {
      name: this.newUserName,
    };
    this.users.push(newUser);
    this.newUserName = undefined;
    this.totalUsers = this.users.length;
  }

  deleteUser(userName: string) {
    const index = this.users.findIndex((user) => user.name === userName);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
    this.totalUsers = this.users.length;
  }

  onStartClick() {
    if (this.totalRoles !== this.totalUsers) {
      this.error = 'Player count and Role count dont match :/';
      return;
    }
    this.error = undefined;
    this.gameState = GameState.SetRoles;
    this.broadcastService.sendMessage({ type: BroadcastType.Shuffle });

    const allRoles = [];
    for (let key in this.allRolesHash) {
      allRoles.push(this.allRolesHash[key]);
    }

    this.assignRolesAndCards(this.users, allRoles);
  }

  assignRolesAndCards(users: User[], allRoles: Role[]) {
    const assignments: { role: Role; card: Card }[] = [];

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
      throw new Error('Mismatch between users and role assignments');
    }

    users.forEach((user, i) => {
      user.role = shuffledAssignments[i].role;
      user.card = shuffledAssignments[i].card;
      user.lives = 1;
    });
  }

  onRolesSet() {
    this.round = 0;
    this.runNight();
  }

  runNight() {
    this.gameState = GameState.Night;
    this.round += 1;
    this.broadcastService.sendMessage({
      type: BroadcastType.Text,
      text: 'Everyone, Close your eyes',
    });
    this.postNightUsers = _.cloneDeep(this.users);
    this.roleIsAwake = false;
    this.mafiaAlive = getLivingMafiaNo(this.users);

    this.cupidConnected = [];
    this.sniperShot = undefined;
    this.gamblerAlive = true;
    this.altruistResurrected = undefined;

    for (let key in this.allRolesHash) {
      const role = this.allRolesHash[key];
      role.hasWokenUp = false;
      role.actionPerformed = false;
      if (role.wakeUp && role.firstNightOnly && this.round > 1) {
        role.wakeUp = false;
      } else if (role.wakeUp && role.singleActionPerformed) {
        role.wakeUp = false;
      }
    }
  }

  wakeRole(roleName) {
    this.allRolesHash[roleName].isAwake = true;
    this.allRolesHash[roleName].hasWokenUp = true;
    this.roleIsAwake = true;
    this.broadcastService.sendMessage({
      type: BroadcastType.Role,
      role: roleName,
    });
    if (roleName === RoleType.Doppelganger) {
      const doppelganger = getUsersWithRole(this.users, RoleType.Doppelganger)[0]
      if (doppelganger.doppelgangerRole) {
        this.broadcastService.sendMessage({
          type: BroadcastType.Doppelganger,
          role: doppelganger.doppelgangerRole.name,
        });
      }
    }
  }

  sleepRole(roleName) {
    this.allRolesHash[roleName].isAwake = false;
    this.roleIsAwake = false;
    this.broadcastService.sendMessage({
      type: BroadcastType.Text,
      text: roleName + ' go to sleep 😴',
    });
  }

  saveTurn(roleName, selected: { user1?: string; user2?: string }, isDoppelganger?: boolean) {
    const firstUserName = selected.user1;
    const firstUser = findUser(this.postNightUsers, firstUserName);
    const secondUserName = selected.user2;
    const role = this.allRolesHash[roleName];
    role.actionPerformed = true;

    if (role.singleAction) {
      role.singleActionPerformed = true;
    }

    switch (roleName) {
      case RoleType.Altruist:
        if (!isUserAlive(this.postNightUsers, firstUserName)) {
          addLife(this.postNightUsers, firstUserName);
          if (isDoppelganger) {
            this.doppelgangerAction = 'Resurrected ' + firstUserName;
          } else {
            this.altruistResurrected = firstUserName;
          }
        }
        break;
      case RoleType.GuardianAngel:
        addLife(this.postNightUsers, firstUserName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Gave extra life too' + firstUserName;
        } else {
          this.guardianAngelSaved = firstUserName;
        }
        break;
      case RoleType.Doctor:
        addLife(this.postNightUsers, firstUserName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Saved' + firstUserName;
        } else {
          this.doctorSaved = firstUserName;
        }
        break;

      case RoleType.Mafia:
        removeLife(this.postNightUsers, firstUserName, roleName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Killed' + firstUserName;
        } else {
          this.mafiaKilled = firstUserName;
        }
        break;
      case RoleType.Sniper:
        removeLife(this.postNightUsers, firstUserName, roleName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Shot' + firstUserName;
        } else {
          this.sniperShot = firstUserName;
        }
        break;

      case RoleType.Detective:
        const isMafia = detectUser(this.postNightUsers, firstUserName);
        this.broadcastService.sendMessage({
          type: BroadcastType.Text,
          text: isMafia ? 'They are Mafia ✅' : 'They arent Mafia ❌',
        });
        break;
      case RoleType.Clairvoyant:
        if (!isUserAlive(this.postNightUsers, firstUserName)) {
          this.broadcastService.sendMessage({
            type: BroadcastType.Text,
            text: 'They are a ' + firstUser.role.name,
          });
        }
        break;
      case RoleType.Investigator:
        this.broadcastService.sendMessage({
          type: BroadcastType.Text,
          text: 'They are a ' + firstUser.role.name,
        });
        break;

      case RoleType.Cupid:
        if (isDoppelganger) {
          this.doppelgangerAction = 'Made fall in love' + firstUserName;
          this.cupidConnected.push(firstUserName);
        } else {
          this.cupidConnected.push(firstUserName);
          this.cupidConnected.push(secondUserName);
        }
        break;

      case RoleType.Gambler:
        if (isDoppelganger) {
          this.doppelgangerAction = 'Bet on ' + firstUserName;
        } else {
          this.gamblerBet = firstUserName;
        }
        break;

      case RoleType.Doppelganger:
        this.doppelgangerTurn(firstUserName, secondUserName)
        break;

      case RoleType.TaxiDriver:
        this.taxiDriverTurn(firstUserName)
        if (isDoppelganger) {
          this.doppelgangerAction = 'Stopped ' + firstUserName;
        } else {
          this.taxiDriverBlocks = firstUserName;
        }
        if (role.singleAction) {
          role.singleActionPerformed = false;
        }
        break;
    }
  }

  doppelgangerTurn(firstUserName: string, secondUserName: string) {
    const user = getUsersWithRole(this.postNightUsers, RoleType.Doppelganger)[0]
    if (!user.doppelgangerRole) {
      user.doppelgangerRole = findUser(this.postNightUsers, firstUserName).role
      this.doppelgangerRole = user.doppelgangerRole
      this.broadcastService.sendMessage({
        type: BroadcastType.Doppelganger,
        role: user.doppelgangerRole.name,
      });
    } else {
      this.saveTurn(user.doppelgangerRole.name, {user1: firstUserName, user2: secondUserName}, true)
    }
  }

  taxiDriverTurn(firstUserName: string) {
    const stoppedUser = findUser(this.postNightUsers, firstUserName)
    let roleName = stoppedUser.role.name
    if (roleName === RoleType.Doppelganger) {
      roleName = stoppedUser.doppelgangerRole.name
    }

    switch (roleName) {
      case RoleType.Mafia:
      case RoleType.Sniper:
        addLife(this.postNightUsers, firstUserName)
        break;

      case RoleType.Doctor:
      case RoleType.Altruist:
        removeLife(this.postNightUsers, firstUserName);
        break;

      case RoleType.Cupid:
        this.cupidConnected = []
        break;
    }
  }

  calculateResult() {
    this.onClearScreen();

    // Remove Doppelganger from priority list
    if (this.round === 1) {
      const index = this.priorityRoles.findIndex(
        (role) => RoleType.Doppelganger
      );
      if (index !== -1) {
        this.priorityRoles.splice(index, 1);
      }
    }

    const mafiaCurrentlyAlive = getLivingMafiaNo(this.postNightUsers);
    if (mafiaCurrentlyAlive < this.mafiaAlive) {
      // A mafia has died somehow, roll to see if action completed
      // Out of scope
    }


    // Cupid logic
    if (!_.isEmpty(this.cupidConnected)) {
      const cupid0 = this.cupidConnected[0];
      const cupid1 = this.cupidConnected[1];
      const cupid0User = findUser(this.postNightUsers, cupid0);
      const cupid0PreUser = findUser(this.users, cupid0);
      const cupid1User = findUser(this.postNightUsers, cupid1);
      const cupid1PreUser = findUser(this.users, cupid1);

      if (cupid0User.lives < cupid0PreUser.lives) {
        removeLifeFromUser(cupid1User);
      } else if (cupid1User.lives < cupid1PreUser.lives) {
        removeLifeFromUser(cupid0User);
      }
    }

    // Check if gambler is alive
    if (this.gamblerBet) {
      const gamblerUser = findUser(this.postNightUsers, this.gamblerBet)
      if (gamblerUser.lives < 1) {
        const gambler = getUsersWithRole(this.postNightUsers, RoleType.Gambler) 
        removeLifeFromUser(gambler[0])
        this.gamblerAlive = gambler[0].lives > 1
        this.gamblerName = gambler[0].name
        this.gamblerBet = undefined
      }
    }

    // If doctor saves someone then they gain extra life, this isnt what we want
    if (this.doctorSaved) {
      const doctorUser = findUser(this.postNightUsers, this.doctorSaved)
      if (doctorUser.lives > 1) {
        removeLifeFromUser(doctorUser)
      }
    }

    this.users = _.cloneDeep(this.postNightUsers);
    this.gameState = GameState.Story;
  }

  beginTrial() {
    const winCond = this.checkWinCondition();
    if (winCond) {
      this.gameState = GameState.Setup;
    }

    this.gameState = GameState.Trial;
    this.votedUser = undefined;
    // can only be 1 mayor
    this.mayorUser =
      getUsersWithRole(this.postNightUsers, RoleType.Mayor)[0] || undefined;
  }

  checkWinCondition() {
    const mafiaCurrentlyAlive = getLivingMafiaNo(this.users);
    const villagerCurrentlyAlive = getLivingVillagerNo(this.users);

    if (mafiaCurrentlyAlive === 0) {
      // Villagers win
      this.broadcastService.sendMessage({
        type: BroadcastType.Victory,
        role: RoleType.Villager,
      });
      return true;
    }
    if (villagerCurrentlyAlive <= mafiaCurrentlyAlive) {
      // Mafia win
      this.broadcastService.sendMessage({
        type: BroadcastType.Victory,
        role: RoleType.Mafia,
      });
      return true;
    }
    return false;
  }

  voteOut() {
    this.gameState = GameState.TrialComplete;

    if (this.votedUser) {
      const votedOutUser = findUser(this.users, this.votedUser);
      this.broadcastService.sendMessage({
        type: BroadcastType.Text,
        text: this.votedUser + ' has been fount GUILTY 😬😬😬',
      });

      removeLifeFromUser(votedOutUser);

      // If tanner is voted out they win
      if (votedOutUser.role.name === RoleType.Tanner) {
        this.broadcastService.sendMessage({
          type: BroadcastType.Victory,
          role: RoleType.Tanner,
        });
        this.gameState = GameState.Setup;
        return;
      }
    }

    const winCond = this.checkWinCondition();
    if (winCond) {
      this.gameState = GameState.Setup;
    }
  }

  nextRound() {
    this.onClearScreen();
    this.runNight();
  }
}
