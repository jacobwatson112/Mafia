import { RoleType } from '../constants/role.constants';
import rolesJSON from '../json/roles.json' with { type: 'json' };
import { RoleDefinition, RoleDefinitionMap, NightRule } from '../models/role.models';

const ROLE_NIGHT_RULES: Partial<Record<RoleType, NightRule>> = {
  [RoleType.Gambler]: { kind: 'first-night-only' },
  [RoleType.GuardianAngel]: { kind: 'first-night-only' },
  [RoleType.Masons]: { kind: 'first-night-only' },
  [RoleType.Thing]: { kind: 'first-night-only' },
  // Example if you want custom nights:
  // [RoleType.Detective]: { kind: 'night-list', nights: [2, 4, 6] },
};

export function getRole(role: RoleType): RoleDefinition | undefined {
  const raw = (rolesJSON.roles as RoleDefinition[]).find((r) => r.name === role);
  if (!raw) return undefined;
  const cloned = structuredClone(raw);
  cloned.nightRule = ROLE_NIGHT_RULES[cloned.name] ?? { kind: 'every-night' };
  return cloned;
}

export function getAllRoles(): RoleDefinition[] {
  return (rolesJSON.roles as RoleDefinition[]).map((role) => {
    const cloned = structuredClone(role);
    cloned.nightRule = ROLE_NIGHT_RULES[cloned.name] ?? { kind: 'every-night' };
    return cloned;
  });
}

export function getAllRolesHash(): RoleDefinitionMap {
  const map: RoleDefinitionMap = {};
  for (const role of getAllRoles()) {
    map[role.name] = role;
  }
  return map;
}