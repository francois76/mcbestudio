import { ServerListeners } from "../server/ServerListeners";
import { ClientListeners } from "../client/ClientListeners";

export type BothSystem = IVanillaClientSystem | IVanillaServerSystem;
export type BothListeners = ServerListeners | ClientListeners;