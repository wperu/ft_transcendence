import { PongUser } from "./PongUser";

export enum PongModes
{
    DEFAULT,
    // DOUBLE_BALL,
    // DASH,
}

export interface PongPool
{
    user: PongUser,
    modes: PongModes,
}