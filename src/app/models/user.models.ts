import { Card, Role } from "./role.models";

export interface User extends Record<string, any> {
    name: string;
    role?: Role;
    card?: Card;
}