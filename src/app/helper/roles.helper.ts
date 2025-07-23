import { RoleType } from "../constants/role.constants";
import rolesJSON from "../json/roles.json" assert { type: 'json'}
import { Role } from "../models/role.models";

export function getRole(role: RoleType) {
    return (rolesJSON.roles as Role[]).find(r => r.name === role);
}