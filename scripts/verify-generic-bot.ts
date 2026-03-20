
import { getTemplate } from '../src/lib/bots/templates';
import { getTemplateContent } from '../src/lib/bots/templates';

async function verify() {
    console.log('Verifying Generic Reply Bot...');
    const bot = getTemplate('generic_reply_bot');

    if (!bot) {
        console.error('FAIL: generic_reply_bot template not found!');
        process.exit(1);
    }
    console.log('PASS: Template found.');

    if (bot.conditions.some(c => c.type === 'exclude_automated')) {
        console.log('PASS: exclude_automated condition found.');
    } else {
        console.error('FAIL: exclude_automated condition MISSING.');
        process.exit(1);
    }

    const content = getTemplateContent('generic_auto_reply', {
        sender_name: 'John Doe',
        subject_reference: 'Project Update'
    });

    if (content.includes('John Doe') && content.includes('Project Update')) {
        console.log('PASS: Template content generation works.');
    } else {
        console.error('FAIL: Template content generation failed.');
        console.log('Content:', content);
        process.exit(1);
    }
}

verify();
