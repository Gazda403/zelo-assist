'use server';
import { auth } from '@/auth';
export async function getBotsAction() { return []; }
export async function createBotAction(bot: any) { return { ...bot, id: '1' }; }
export async function deleteBotAction(id: string) { return; }
export async function syncBotsAction() { return { success: true, emailsProcessed: 0 }; }
