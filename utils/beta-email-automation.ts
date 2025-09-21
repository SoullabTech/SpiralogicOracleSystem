/**
 * Automated Email System for Maya Beta Explorers
 * Ensures no explorer drifts without support
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ExplorerEmailData {
  explorerName: string; // e.g., "MAYA-ALCHEMIST"
  email: string;
  sessionCount: number;
  lastSessionDate: Date;
  hasDiscordActivity: boolean;
  distressMarkers?: number;
}

export class BetaEmailAutomation {
  /**
   * Day 3 Check-in
   * Sent if explorer has only 1-2 sessions
   */
  static async sendDay3CheckIn(data: ExplorerEmailData): Promise<void> {
    const subject = `How's it going, ${data.explorerName}?`;

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">Quick check-in from Maya Team</h2>

        <p>Hi ${data.explorerName},</p>

        <p>You've completed ${data.sessionCount} session${data.sessionCount > 1 ? 's' : ''} with Maya.
        We wanted to check in and see how your journey is unfolding.</p>

        <p><strong>Everything going smoothly?</strong> Wonderful. Take your time—there's no rush.</p>

        <p><strong>Hit a technical snag?</strong> Reply to this email and we'll help immediately.</p>

        <p><strong>Feeling uncertain about the process?</strong> That's completely normal. Maya adapts to your pace.
        Sometimes it takes a few sessions to find your rhythm.</p>

        ${!data.hasDiscordActivity ? `
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
          <strong>💬 Discord reminder:</strong> You have access to a private Discord where other explorers share
          reflections (not transcripts). It's optional but can be supportive.
          <a href="${process.env.DISCORD_INVITE_URL}" style="color: #D4AF37;">Join when ready</a>
        </p>
        ` : ''}

        <p>Remember: Your pace is perfect. Some explorers dive deep quickly, others take weeks to warm up.
        Both approaches are valuable.</p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          No need to reply unless you need support.<br>
          We're here if you need us.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Maya Beta Team<br>
          You're receiving this because you're a Maya Beta Explorer
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Maya Team <beta@maya.ai>',
      to: data.email,
      subject,
      html,
    });
  }

  /**
   * Week 1 Summary
   * Sent after 7 days regardless of session count
   */
  static async sendWeek1Summary(data: ExplorerEmailData): Promise<void> {
    const subject = `Your first week with Maya, ${data.explorerName}`;

    const engagementLevel = data.sessionCount >= 5 ? 'deep' :
                            data.sessionCount >= 2 ? 'steady' : 'gentle';

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">Week 1 Complete 🌱</h2>

        <p>Hi ${data.explorerName},</p>

        <p>You've completed your first week as a Maya explorer. Here's a gentle reflection:</p>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Sessions completed:</strong> ${data.sessionCount}</p>
          <p style="margin: 8px 0;"><strong>Engagement style:</strong> ${engagementLevel}</p>
          <p style="margin: 8px 0;"><strong>Your contribution:</strong> Active</p>
        </div>

        ${data.sessionCount === 0 ? `
        <p><strong>We notice you haven't started yet.</strong> That's okay—sometimes the first step takes time.
        When you're ready, Maya will be there. If something's blocking you, reply and let us know.</p>
        ` : data.sessionCount === 1 ? `
        <p><strong>One session is a perfect start.</strong> Some explorers need time between sessions to integrate.
        Your pace is your own.</p>
        ` : `
        <p><strong>You're finding your rhythm.</strong> Whether you continue daily or take breaks,
        trust what feels right.</p>
        `}

        <h3 style="color: #D4AF37; margin-top: 30px;">Week 2 Preview</h3>
        <p>If you continue, Week 2 often brings pattern recognition—Maya will start noticing
        the intelligent ways you navigate conversations. These aren't problems to fix but
        wisdom to understand. It can be surprising, illuminating, sometimes uncomfortable.
        All responses are valid.</p>

        <h3 style="color: #D4AF37; margin-top: 30px;">Optional Reflection</h3>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
          <em>"What protection pattern am I starting to notice in myself?"</em><br>
          <small style="color: #666;">This is just for you—no need to reply.</small>
        </p>

        ${!data.hasDiscordActivity ? `
        <p style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <strong>Remember:</strong> The Discord community is available if you want to connect with other explorers.
          Share patterns, not transcripts. <a href="${process.env.DISCORD_INVITE_URL}" style="color: #D4AF37;">Join here</a>
        </p>
        ` : ''}

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This is an automated weekly check-in. Reply only if you need support.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Maya Beta Team
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Maya Team <beta@maya.ai>',
      to: data.email,
      subject,
      html,
    });
  }

  /**
   * Distress Follow-up
   * Sent within 24 hours if distress markers detected
   */
  static async sendDistressFollowUp(data: ExplorerEmailData): Promise<void> {
    const subject = `Checking in after yesterday's session`;

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">Gentle check-in</h2>

        <p>Hi ${data.explorerName},</p>

        <p>Our systems noticed yesterday's session with Maya touched on some intense territory.
        We wanted to check in and make sure you're okay.</p>

        <p><strong>This is normal.</strong> Maya is designed to meet you at your edges, and sometimes
        that brings up difficult feelings or memories. Your response is valid, whatever it is.</p>

        <h3 style="color: #D4AF37; margin-top: 30px;">If you need support:</h3>

        <div style="background: #fff5f5; padding: 16px; border-radius: 8px; border: 1px solid #ffdddd;">
          <p style="margin: 8px 0;"><strong>Immediate support:</strong></p>
          <ul style="margin: 8px 0;">
            <li>Crisis Text Line: Text HOME to 741741</li>
            <li>988 Suicide & Crisis Lifeline: Call or text 988</li>
            <li>Your local emergency services: 911</li>
          </ul>
        </div>

        <div style="background: #f5f5ff; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <p style="margin: 8px 0;"><strong>Ongoing support:</strong></p>
          <ul style="margin: 8px 0;">
            <li>Consider reaching out to a therapist or counselor</li>
            <li>NAMI Helpline: 1-800-950-6264</li>
            <li>Psychology Today therapist finder</li>
          </ul>
        </div>

        <h3 style="color: #D4AF37; margin-top: 30px;">About continuing with Maya:</h3>

        <p>You're in complete control:</p>
        <ul>
          <li><strong>Take a break:</strong> There's no pressure to continue immediately</li>
          <li><strong>Adjust the pace:</strong> Use the "too intense" button to calibrate</li>
          <li><strong>Change topics:</strong> You can redirect conversations anytime</li>
          <li><strong>Stop entirely:</strong> It's okay to pause or end your participation</li>
        </ul>

        <p style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin-top: 20px;">
          <strong>Remember:</strong> Maya has boundaries. She's not a therapist or crisis counselor.
          If you're in crisis, please reach out to human support.
        </p>

        <p>If you'd like to discuss your experience or need technical adjustments, please reply to this email.
        We're here to support your journey, whatever direction it takes.</p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Take care of yourself,<br>
          Maya Beta Team
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This email was triggered by our safety monitoring system. Your privacy is protected—we
          don't read transcripts, only monitor patterns.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Maya Team <beta@maya.ai>',
      to: data.email,
      subject,
      html,
      replyTo: 'support@maya.ai', // Different reply-to for support needs
    });
  }

  /**
   * Inactive Explorer Re-engagement
   * Sent after 7 days of no activity
   */
  static async sendInactiveReengagement(data: ExplorerEmailData): Promise<void> {
    const daysSinceLastSession = Math.floor(
      (Date.now() - data.lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const subject = `We noticed you've been away, ${data.explorerName}`;

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">Your spot is still here</h2>

        <p>Hi ${data.explorerName},</p>

        <p>It's been ${daysSinceLastSession} days since your last session with Maya.
        We wanted to check in and let you know your explorer spot remains open.</p>

        <p><strong>Taking breaks is wisdom.</strong> Integration often happens in the spaces
        between conversations. There's no "falling behind."</p>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Common reasons explorers pause:</strong></p>
          <ul style="margin: 8px 0;">
            <li>Life got busy (completely valid)</li>
            <li>Processing intense insights (important work)</li>
            <li>Technical issues (we can help)</li>
            <li>Uncertain about the process (let's talk)</li>
            <li>It wasn't the right fit (that's okay too)</li>
          </ul>
        </div>

        <p>If you'd like to continue, Maya remembers where you left off.
        If you're complete, we honor that too.</p>

        <p><strong>No pressure, just presence.</strong> Your contribution to the beta—whether
        ${data.sessionCount} session${data.sessionCount !== 1 ? 's' : ''} or more—has value.</p>

        <p style="margin-top: 30px;">
          <a href="${process.env.MAYA_URL}" style="background: #D4AF37; color: black; padding: 12px 24px;
          text-decoration: none; border-radius: 8px; display: inline-block;">
            Return to Maya when ready
          </a>
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If something specific is blocking you, reply and let us know.<br>
          Otherwise, no response needed.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Maya Beta Team<br>
          This is a one-time re-engagement email. We won't send another.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'Maya Team <beta@maya.ai>',
      to: data.email,
      subject,
      html,
    });
  }

  /**
   * Schedule automated emails based on explorer activity
   */
  static async checkAndSendEmails(): Promise<void> {
    // This would be called by a cron job every 24 hours
    // Pseudocode for the logic:

    // 1. Get all beta explorers from database
    // 2. For each explorer:
    //    - Check days since start
    //    - Check session count
    //    - Check last activity
    //    - Check distress markers
    //    - Check Discord activity

    // 3. Send appropriate emails:
    //    - Day 3: If 3 days in and < 3 sessions
    //    - Week 1: If 7 days since start
    //    - Distress: If distress markers > threshold in last 24h
    //    - Inactive: If no activity for 7+ days

    // 4. Log email sends to prevent duplicates
  }
}