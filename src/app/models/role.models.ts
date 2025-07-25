import { RoleColor, RoleType, RoleUserType } from "../constants/role.constants";

export interface Role extends Record<string, any> {
    name: RoleType;
    description: string;
    text?: string;
    players: number;
    adminInfo?: string;
    wakeUp: boolean;
    isAwake: boolean;
    hasWokenUp: boolean;
    firstNightOnly: boolean;
    singleAction: boolean;
    singleActionPerformed: boolean;
    actionPerformed: boolean;
    saveAction: boolean;
    requiresTwoUsers: boolean;
    roleUserType: RoleUserType;
    cards: Card[],
}

export interface Card {
    name: string;
    char: string;
    color: RoleColor;
}