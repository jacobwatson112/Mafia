import { RoleType } from '../constants/role.constants';
import { User } from '../models/user.models';

export function shuffle<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function findUser(users: User[], userName: string): User {
  for (let user of users) {
    if (user.name === userName) {
      return user;
    }
  }
  return undefined;
}

export function getUsersWithRole(users: User[], roleName: RoleType): User[] {
  const usersWithRole: User[] = []
  for (let user of users) {
    if (user.role.name === roleName) {
      usersWithRole.push(user)
    }
  }
  return usersWithRole
}

export function detectUser(users: User[], userName: string): boolean {
  const user = findUser(users, userName);
  if (user.role.name === RoleType.Mafia || user.role.name === RoleType.Tanner) {
    return true;
  }
  return false;
}

export function isUserAlive(users: User[], userName: string): boolean {
  const user = findUser(users, userName);
  if (user.lives > 0) {
    return true;
  }
  return false;
}

export function addLife(users: User[], userName: string) {
  const user = findUser(users, userName);
  user.lives += 1;
}

export function removeLifeFromUser(user: User, role?: RoleType) {
    if (role === RoleType.Mafia && user.role.name === RoleType.Gambler) {
    return;
  }
  user.lives -= 1;
}

export function removeLife(users: User[], userName: string, role?: RoleType) {
  const user = findUser(users, userName);
  removeLifeFromUser(user, role)
}

export function getLivingMafiaNo(users: User[]): number {
  let mafiaAlive: number = 0;
  for (let user of users) {
    if (user.lives > 0) {
      if (
        user.role.name === RoleType.Mafia ||
        user.role.name === RoleType.MafiaBoss
      ) {
        mafiaAlive += 1;
      }
    }
  }
  return mafiaAlive;
}

export function getLivingVillagerNo(users: User[]): number {
  let villagerAlive: number = 0;
  for (let user of users) {
    if (user.lives > 0) {
      if (
        user.role.name !== RoleType.Mafia &&
        user.role.name !== RoleType.MafiaBoss
      ) {
        villagerAlive += 1;
      }
      if (user.role.name === RoleType.Mayor) {
        villagerAlive += 1;
      }
    }
  }
  return villagerAlive;
}
