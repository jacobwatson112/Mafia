import { RoleType } from './role.constants';

export enum BroadcastType {
  Clear = 'clear',
  Doppelganger = 'doppelganger',
  Role = 'role',
  Shuffle = 'shuffle',
  Test = 'test',
  Text = 'text',
  Victory = 'victory',
}

export interface VictoryRevealUser {
  name: string;
  role: RoleType;
  cardName: string;
  cardChar: string;
  cardColor: string;
}

export type BroadcastMessage =
  | { type: BroadcastType.Clear }
  | { type: BroadcastType.Shuffle }
  | { type: BroadcastType.Test }
  | { type: BroadcastType.Role; role: RoleType }
  | { type: BroadcastType.Doppelganger; role: RoleType }
  | { type: BroadcastType.Text; text: string }
  | { type: BroadcastType.Victory; role: RoleType; revealUsers?: VictoryRevealUser[] };