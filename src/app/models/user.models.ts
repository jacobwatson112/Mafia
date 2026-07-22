import { Card, RoleDefinition } from './role.models';

export interface User {
  name: string;
  role?: RoleDefinition;
  card?: Card;
  lives?: number;
  doppelgangerRole?: RoleDefinition;
}