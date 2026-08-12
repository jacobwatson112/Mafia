import { RoleType } from '../constants/role.constants';
import rolesJSON from '../json/roles.json' with { type: 'json' };
import { RoleDefinition, RoleDefinitionMap } from '../models/role.models';

export function getRole(role: RoleType): RoleDefinition | undefined {
  const raw = (rolesJSON.roles as RoleDefinition[]).find((r) => r.name === role);
  if (!raw) return undefined;
  return structuredClone(raw);
}

export function getAllRoles(): RoleDefinition[] {
  return (rolesJSON.roles as RoleDefinition[]).map((role) => structuredClone(role));
}

export function getAllRolesHash(): RoleDefinitionMap {
  const map: RoleDefinitionMap = {};
  for (const role of getAllRoles()) {
    map[role.name] = role;
  }
  return map;
}