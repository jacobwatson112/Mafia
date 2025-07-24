import { RoleType } from "../constants/role.constants";
import rolesJSON from "../json/roles.json" assert { type: 'json'}
import { Role } from "../models/role.models";

export function getRole(role: RoleType) {
    return (rolesJSON.roles as Role[]).find(r => r.name === role);
}

export function getAllRoles() {
    return rolesJSON.roles as Role[]
}

export function getAllRolesHash() {
    let allRoles = rolesJSON.roles as Role[]
    let allRolesHash = []
    for (let role of allRoles) {
        allRolesHash[role.name] = role
    }
    return allRolesHash
}