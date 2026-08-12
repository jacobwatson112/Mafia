import { RoleColor, RoleType, RoleUserType } from '../constants/role.constants';

export type NightRule =
  | { kind: 'never' }
  | { kind: 'every-night' }
  | { kind: 'first-night-only' }
  | { kind: 'night-list'; nights: number[] };

export interface Card {
  name: string;
  char: string;
  color: RoleColor;
}

export interface RoleDefinition {
  name: RoleType;
  description: string;
  text?: string;
  players: number;
  adminInfo?: string;
  wakeRule: NightRule;
  singleAction: boolean;
  saveAction: boolean;
  requiresTwoUsers: boolean;
  roleUserType: RoleUserType;
  cards: Card[];
}

/**
 * Mutable per-game role state (round-by-round).
 */
export interface RoleRuntimeState {
  isAwake: boolean;
  hasWokenUp: boolean;
  actionPerformed: boolean;
  singleActionPerformed: boolean;
}

export type RoleRuntimeStateMap = Partial<Record<RoleType, RoleRuntimeState>>;
export type RoleDefinitionMap = Partial<Record<RoleType, RoleDefinition>>;