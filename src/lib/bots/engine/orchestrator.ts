export async function executeBots(event: any, userId: string) { console.log('Executing bots for:', event.subject); }
export async function testBot(bot: any, event: any) { return { wouldExecute: true, plannedActions: [] }; }
