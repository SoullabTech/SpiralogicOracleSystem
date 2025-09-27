import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BetaInvite {
  name: string;
  email: string;
}

const templateConfig: Record<string, { subject: string; tag: string }> = {
  'beta-invitation': { subject: 'Your MAIA Beta Invitation', tag: 'invitation' },
  'beta-welcome': { subject: 'Welcome to MAIA Beta', tag: 'welcome' },
  'beta-week1-checkin': { subject: 'Week 1 with MAIA - How is it going?', tag: 'week1-checkin' },
  'beta-week2-survey': { subject: 'MAIA Beta Feedback - Week 2', tag: 'week2-survey' },
  'beta-week3-group-call': { subject: 'Join Our Beta Group Call', tag: 'week3-group-call' },
  'beta-week4-closing': { subject: 'MAIA Beta - Final Reflections', tag: 'week4-closing' },
};

export async function sendBetaInvite(invite: BetaInvite, template: string = 'beta-invitation') {
  try {
    const config = templateConfig[template] || templateConfig['beta-invitation'];
    const htmlTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.html`);
    const textTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.txt`);

    const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
    let textTemplate = '';
    if (fs.existsSync(textTemplatePath)) {
      textTemplate = fs.readFileSync(textTemplatePath, 'utf-8');
    }

    const personalizedHtml = htmlTemplate.replace(/\{\{Name\}\}/g, invite.name);
    const personalizedText = textTemplate ? textTemplate.replace(/\{\{Name\}\}/g, invite.name) : '';

    const result = await resend.emails.send({
      from: 'Kelly @ Soullab <onboarding@resend.dev>',
      to: invite.email,
      subject: config.subject,
      html: personalizedHtml,
      text: personalizedText,
      tags: [
        { name: 'campaign', value: 'beta-launch' },
        { name: 'type', value: config.tag }
      ]
    });

    console.log(`✅ Sent to ${invite.name} (${invite.email}):`, result.id);
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error(`❌ Failed to send to ${invite.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendBatchInvites(invites: BetaInvite[], template: string = 'beta-invitation', delayMs: number = 2000) {
  const results = [];

  for (const invite of invites) {
    const result = await sendBetaInvite(invite, template);
    results.push({ ...invite, ...result });

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n📊 Batch complete: ${successful} sent, ${failed} failed`);

  return {
    total: invites.length,
    successful,
    failed,
    results
  };
}