import { RoleColor, RoleType } from "../constants/role.constants";

export interface Role extends Record<string, any> {
    name: RoleType;
    description: string;
    text?: string;
    players: number;
    adminInfo?: string;
    wakeUp: boolean;
    firstNightOnly: boolean;
    singleAction: boolean;
    cards: Card[],
}

export interface Card {
    name: string;
    char: string;
    color: RoleColor;
}