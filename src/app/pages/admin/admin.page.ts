import { Component } from '@angular/core';
import { BroadcastService } from '../../services/broadcast.service';
import { BroadcastType } from '../../constants/broadcast.constants';
import { RoleType } from '../../constants/role.constants';
import { GameState } from '../../constants/game.constants';
import { Card, RoleDefinition, RoleDefinitionMap, RoleRuntimeStateMap } from '../../models/role.models';
import { getAllRolesHash } from '../../helper/roles.helper';
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
import _ from 'lodash';

type PlayerName = string;

interface NightSummaryState {
  altruistResurrected?: PlayerName;
  doctorSaved?: PlayerName;
  mafiaKilled: PlayerName[];
  zorgTarget?: PlayerName;
  zorgTriggeredSelectors: PlayerName[];
  zorgLinkedDeath?: PlayerName;
  sniperShot?: PlayerName;
  cupidConnected: PlayerName[];
  gamblerBet?: PlayerName;
  gamblerAlive: boolean;
  gamblerName?: PlayerName;
  guardianAngelSaved?: PlayerName;
  doppelgangerRole?: RoleDefinition;
  doppelgangerAction?: string;
  taxiDriverBlocks?: PlayerName;
}

interface TrialState {
  mayorUser?: User;
  votedUser?: PlayerName;
}

interface AdminUiState {
  night: NightSummaryState;
  trial: TrialState;
}

const createInitialNightSummaryState = (): NightSummaryState => ({
  mafiaKilled: [],
  zorgTriggeredSelectors: [],
  cupidConnected: [],
  gamblerAlive: true,
});

const createInitialTrialState = (): TrialState => ({});

const createInitialAdminUiState = (): AdminUiState => ({
  night: createInitialNightSummaryState(),
  trial: createInitialTrialState(),
});

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {
  gameState: GameState = GameState.Setup;
  error: string;

  allRolesHash: RoleDefinitionMap;
  users: User[];
  postNightUsers: User[];

  totalRoles: number;
  totalUsers: number;

  mafiaNo: number;
  villagerNo: number;

  newUserName: string;

  round: number;
  enableMafiaDoubleKillFromNight3 = false;
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

  uiState: AdminUiState = createInitialAdminUiState();

  get altruistResurrected() {
    return this.uiState.night.altruistResurrected;
  }
  set altruistResurrected(value: string | undefined) {
    this.uiState.night.altruistResurrected = value;
  }

  get doctorSaved() {
    return this.uiState.night.doctorSaved;
  }
  set doctorSaved(value: string | undefined) {
    this.uiState.night.doctorSaved = value;
  }

  get mafiaKilled() {
    return this.uiState.night.mafiaKilled;
  }
  set mafiaKilled(value: string[]) {
    this.uiState.night.mafiaKilled = value;
  }

  get sniperShot() {
    return this.uiState.night.sniperShot;
  }
  set sniperShot(value: string | undefined) {
    this.uiState.night.sniperShot = value;
  }

  get zorgTarget() {
    return this.uiState.night.zorgTarget;
  }
  set zorgTarget(value: string | undefined) {
    this.uiState.night.zorgTarget = value;
  }

  get zorgTriggeredSelectors() {
    return this.uiState.night.zorgTriggeredSelectors;
  }
  set zorgTriggeredSelectors(value: string[]) {
    this.uiState.night.zorgTriggeredSelectors = value;
  }

  get zorgLinkedDeath() {
    return this.uiState.night.zorgLinkedDeath;
  }
  set zorgLinkedDeath(value: string | undefined) {
    this.uiState.night.zorgLinkedDeath = value;
  }

  get cupidConnected() {
    return this.uiState.night.cupidConnected;
  }
  set cupidConnected(value: string[]) {
    this.uiState.night.cupidConnected = value;
  }

  get gamblerBet() {
    return this.uiState.night.gamblerBet;
  }
  set gamblerBet(value: string | undefined) {
    this.uiState.night.gamblerBet = value;
  }

  get gamblerAlive() {
    return this.uiState.night.gamblerAlive;
  }
  set gamblerAlive(value: boolean) {
    this.uiState.night.gamblerAlive = value;
  }

  get gamblerName() {
    return this.uiState.night.gamblerName;
  }
  set gamblerName(value: string | undefined) {
    this.uiState.night.gamblerName = value;
  }

  get guardianAngelSaved() {
    return this.uiState.night.guardianAngelSaved;
  }
  set guardianAngelSaved(value: string | undefined) {
    this.uiState.night.guardianAngelSaved = value;
  }

  get doppelgangerRole() {
    return this.uiState.night.doppelgangerRole;
  }
  set doppelgangerRole(value: RoleDefinition | undefined) {
    this.uiState.night.doppelgangerRole = value;
  }

  get doppelgangerAction() {
    return this.uiState.night.doppelgangerAction;
  }
  set doppelgangerAction(value: string | undefined) {
    this.uiState.night.doppelgangerAction = value;
  }

  get taxiDriverBlocks() {
    return this.uiState.night.taxiDriverBlocks;
  }
  set taxiDriverBlocks(value: string | undefined) {
    this.uiState.night.taxiDriverBlocks = value;
  }

  get mayorUser() {
    return this.uiState.trial.mayorUser;
  }
  set mayorUser(value: User | undefined) {
    this.uiState.trial.mayorUser = value;
  }

  get votedUser() {
    return this.uiState.trial.votedUser;
  }
  set votedUser(value: string | undefined) {
    this.uiState.trial.votedUser = value;
  }

  private resetNightSummaryState() {
    this.uiState.night = createInitialNightSummaryState();
  }

  private resetTrialState() {
    this.uiState.trial = createInitialTrialState();
  }

  roleState: RoleRuntimeStateMap = {};
  private selectedByTarget: Record<string, Set<string>> = {};

  isMafiaDoubleKillNight(): boolean {
    return this.enableMafiaDoubleKillFromNight3 && this.round >= 3;
  }

  shouldShowSecondTarget(role: RoleDefinition | undefined): boolean {
    if (!role) {
      return false;
    }
    return role.requiresTwoUsers || (role.name === RoleType.Mafia && this.isMafiaDoubleKillNight());
  }

  roleCanWakeThisNight(roleName: RoleType): boolean {
    const role = this.allRolesHash[roleName];
    if (!role || role.players < 1) return false;

    const runtime = this.roleState[roleName];
    if (roleName !== RoleType.Zorg && runtime?.singleActionPerformed) return false;

    const nightRule = role.wakeRule;

    switch (nightRule.kind) {
      case 'never':
        return false;
      case 'every-night':
        return true;
      case 'first-night-only':
        return this.round === 1;
      case 'night-list':
        return nightRule.nights.includes(this.round);
      default:
        return true;
    }
  }

  private initRoleRuntimeState() {
    this.roleState = {};
    for (const role of Object.values(this.allRolesHash)) {
      this.roleState[role.name] = {
        isAwake: false,
        hasWokenUp: false,
        actionPerformed: false,
        singleActionPerformed: false,
      };
    }
  }

  private getSelectorsForTurn(roleName: RoleType, isDoppelganger?: boolean): string[] {
    const selectors = isDoppelganger
      ? getUsersWithRole(this.postNightUsers, RoleType.Doppelganger)
      : getUsersWithRole(this.postNightUsers, roleName);

    return selectors
      .map((user) => user.name)
      .filter((name): name is string => !!name);
  }

  private recordTargetSelections(roleName: RoleType, targets: Array<string | undefined>, isDoppelganger?: boolean) {
    const selectors = this.getSelectorsForTurn(roleName, isDoppelganger);
    if (selectors.length === 0) {
      return;
    }

    for (const rawTarget of targets) {
      if (!rawTarget) {
        continue;
      }
      if (!this.selectedByTarget[rawTarget]) {
        this.selectedByTarget[rawTarget] = new Set<string>();
      }
      for (const selectorName of selectors) {
        this.selectedByTarget[rawTarget].add(selectorName);
      }
    }
  }

  private eliminateUser(user: User | undefined) {
    if (!user) {
      return;
    }
    while (user.lives > 0) {
      removeLifeFromUser(user);
    }
  }

  private resolveZorgConsequences() {
    const zorgUser = getUsersWithRole(this.postNightUsers, RoleType.Zorg)[0];
    if (!zorgUser || !this.zorgTarget) {
      return;
    }

    const zorgTargetUser = findUser(this.postNightUsers, this.zorgTarget);
    if (!zorgTargetUser) {
      return;
    }

    if (zorgTargetUser.lives < 1) {
      const selectors = this.selectedByTarget[this.zorgTarget]
        ? [...this.selectedByTarget[this.zorgTarget]]
        : [];
      const victims: string[] = [];

      for (const selectorName of selectors) {
        if (selectorName === zorgUser.name) {
          continue;
        }
        const selectorUser = findUser(this.postNightUsers, selectorName);
        if (!selectorUser || selectorUser.lives < 1) {
          continue;
        }
        this.eliminateUser(selectorUser);
        victims.push(selectorName);
      }

      this.zorgTriggeredSelectors = victims;
    }

    if (zorgUser.lives < 1 && zorgTargetUser.lives > 0) {
      this.eliminateUser(zorgTargetUser);
      this.zorgLinkedDeath = zorgTargetUser.name;
    }
  }

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
    this.initRoleRuntimeState();

    this.mafiaNo = this.allRolesHash[RoleType.Mafia].players;
    this.villagerNo = this.allRolesHash[RoleType.Villager].players;

    this.users = getAllUsers() || [];
    this.totalUsers = this.users.length;
    this.initSelectedUsers();

    this.resetGameState();
  }



  resetGameState() {
    this.gameState = GameState.Setup;
    this.uiState = createInitialAdminUiState();
    this.initRoleRuntimeState();

    for (let user of this.users) {
      user.role = undefined;
      user.card = undefined;
    }

    this.calculateTotalRoles();
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

  assignRolesAndCards(users: User[], allRoles: RoleDefinition[]) {
    const assignments: { role: RoleDefinition; card: Card }[] = [];

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
    this.selectedByTarget = {};

    this.resetNightSummaryState();

    for (let key in this.allRolesHash) {
      const role = this.allRolesHash[key];
      const runtime = this.roleState[role.name];
      if (!runtime) {
        continue;
      }
      runtime.isAwake = false;
      runtime.hasWokenUp = false;
      runtime.actionPerformed = false;
      if (role.name === RoleType.Zorg) {
        runtime.singleActionPerformed = false;
      }
    }
  }

  wakeRole(roleName) {
    const runtime = this.roleState[roleName];
    if (!runtime) {
      return;
    }
    runtime.isAwake = true;
    runtime.hasWokenUp = true;
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
    const runtime = this.roleState[roleName];
    if (!runtime) {
      return;
    }
    runtime.isAwake = false;
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
    const runtime = this.roleState[roleName];
    if (runtime) {
      runtime.actionPerformed = true;
    }

    if (role.singleAction && runtime) {
      runtime.singleActionPerformed = true;
    }

    switch (roleName) {
      case RoleType.Altruist:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
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
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        addLife(this.postNightUsers, firstUserName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Gave extra life too' + firstUserName;
        } else {
          this.guardianAngelSaved = firstUserName;
        }
        break;
      case RoleType.Doctor:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        addLife(this.postNightUsers, firstUserName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Saved' + firstUserName;
        } else {
          this.doctorSaved = firstUserName;
        }
        break;

      case RoleType.Mafia:
        const mafiaTargets: string[] = [firstUserName];
        if (this.isMafiaDoubleKillNight() && secondUserName) {
          mafiaTargets.push(secondUserName);
        }
        this.recordTargetSelections(roleName, mafiaTargets, isDoppelganger);

        const uniqueTargets = [...new Set(mafiaTargets.filter((target): target is string => !!target))];
        for (const target of uniqueTargets) {
          removeLife(this.postNightUsers, target, roleName);
        }

        if (isDoppelganger) {
          this.doppelgangerAction = 'Killed ' + uniqueTargets.join(' and ');
        } else {
          this.mafiaKilled = uniqueTargets;
        }
        break;
      case RoleType.Sniper:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        removeLife(this.postNightUsers, firstUserName, roleName);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Shot' + firstUserName;
        } else {
          this.sniperShot = firstUserName;
        }
        break;

      case RoleType.Detective:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        const isMafia = detectUser(this.postNightUsers, firstUserName);
        this.broadcastService.sendMessage({
          type: BroadcastType.Text,
          text: isMafia ? 'They are Mafia ✅' : 'They arent Mafia ❌',
        });
        break;
      case RoleType.Clairvoyant:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        if (!isUserAlive(this.postNightUsers, firstUserName)) {
          this.broadcastService.sendMessage({
            type: BroadcastType.Text,
            text: 'They are a ' + firstUser.role.name,
          });
        }
        break;
      case RoleType.Investigator:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        this.broadcastService.sendMessage({
          type: BroadcastType.Text,
          text: 'They are a ' + firstUser.role.name,
        });
        break;

      case RoleType.Cupid:
        this.recordTargetSelections(roleName, [firstUserName, secondUserName], isDoppelganger);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Made fall in love' + firstUserName;
          this.cupidConnected.push(firstUserName);
        } else {
          this.cupidConnected.push(firstUserName);
          this.cupidConnected.push(secondUserName);
        }
        break;

      case RoleType.Gambler:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Bet on ' + firstUserName;
        } else {
          this.gamblerBet = firstUserName;
        }
        break;

      case RoleType.Doppelganger:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        this.doppelgangerTurn(firstUserName, secondUserName)
        break;

      case RoleType.TaxiDriver:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        this.taxiDriverTurn(firstUserName)
        if (isDoppelganger) {
          this.doppelgangerAction = 'Stopped ' + firstUserName;
        } else {
          this.taxiDriverBlocks = firstUserName;
        }
        if (role.singleAction && runtime) {
          runtime.singleActionPerformed = false;
        }
        break;

      case RoleType.Zorg:
        this.recordTargetSelections(roleName, [firstUserName], isDoppelganger);
        if (isDoppelganger) {
          this.doppelgangerAction = 'Linked with ' + firstUserName;
        } else {
          this.zorgTarget = firstUserName;
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

      case RoleType.Zorg:
        this.zorgTarget = undefined;
        break;
    }
  }

  calculateResult() {
    this.onClearScreen();

    // Remove Doppelganger from priority list
    if (this.round === 1) {
      const index = this.priorityRoles.findIndex(
        (role) => role === RoleType.Doppelganger
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

      // cupid isnt working
      if (cupid0User.lives < cupid0PreUser.lives) {
        removeLifeFromUser(cupid1User);
      } else if (cupid1User.lives < cupid1PreUser.lives) {
        removeLifeFromUser(cupid0User);
      }
    }

    // Check if gambler is alive
    // Gamber should be able to die after the trial
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

    this.resolveZorgConsequences();

    this.users = _.cloneDeep(this.postNightUsers);
    this.gameState = GameState.Story;
  }

  beginTrial() {
    const winCond = this.checkWinCondition();
    if (winCond) {
      this.gameState = GameState.Setup;
      return;
    }

    this.gameState = GameState.Trial;
    this.resetTrialState();
    this.votedUser = undefined;
    this.mayorUser = getUsersWithRole(this.postNightUsers, RoleType.Mayor)[0];
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

// round prefs  dont work
// doppleganger role icon