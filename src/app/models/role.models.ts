export interface Role extends Record<string, any> {
    name: string;
    description: string;
    text?: string;
    adminInfo?: string;
    wakeUp: boolean;
    firstNightOnly: boolean;
    singleAction: boolean;
}