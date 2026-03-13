import { BOT_TEMPLATES as PRESETS } from './templates';
export const getAllBots = async (userId: string) => { return []; };
export const getBotById = async (id: string, userId: string) => { return null; };
export const createBot = async (bot: any) => { return bot; };
export const updateBotStats = async (botId: string, result: any) => { return; };
export const logExecution = async (log: any) => { return; };
export const getExecutionLogs = async (botId: string, limit: number) => { return []; };
export const getBotStats = async (botId: string) => { return null; };
