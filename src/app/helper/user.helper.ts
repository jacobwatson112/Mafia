import usersJSON from "../json/users.json" assert { type: 'json'}
import { User } from "../models/user.models"

export function getAllUsers() {
    return usersJSON.users as User[]
}