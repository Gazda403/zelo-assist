# Email Bots System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Triggers](#triggers)
4. [Conditions](#conditions)
5. [Actions](#actions)
6. [Safety Mechanisms](#safety-mechanisms)
7. [Bot Templates](#bot-templates)
8. [Creating Custom Bots](#creating-custom-bots)
9. [Testing and Debugging](#testing-and-debugging)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Email Bots System enables automated email workflows based on triggers, conditions, and actions. Bots monitor your inbox and execute configured behaviors when specific criteria are met.

### Key Features
- **Automation**: Respond to emails, create drafts, apply labels automatically
- **Safety First**: Rate limits, cooldowns, loop prevention, and terms acceptance
- **Templates**: Pre-configured bots for common use cases
- **Testing**: Dry-run mode to preview bot behavior before enabling
- **Monitoring**: Execution logs track all bot activity

---

## Architecture

### System Flow

```
Incoming Email → Trigger Evaluation → Condition Checks → Safety Validation → Action Execution
```

### Components

1. **Triggers**: Define when a bot should activate
2. **Conditions**: Optional filters to refine trigger matching
3. **Actions**: What the bot does when triggered
4. **Safety Config**: Rate limits and protective measures

---

## Triggers

Triggers determine when a bot activates. Each bot has exactly one trigger.

### Available Triggers

#### `new_email_received`
Fires for every new email received.
- **Config**: None
- **Use Case**: Universal inbox monitor

#### `email_from_sender`
Fires when email is from specific sender(s).
- **Config**:
  - `senderEmails`: Array of email addresses
  - `matchMode`: `'exact'` | `'contains'` | `'domain'`
- **Use Case**: VIP senders, team members

#### `email_contains_keyword`
Fires when email contains specific keywords.
- **Config**:
  - `keywords`: Array of keywords to match
  - `searchIn`: `'subject'` | `'body'` | `'both'`
- **Use Case**: Support requests, sales inquiries

#### `email_with_attachment`
Fires when email has attachments.
- **Config**:
  - `minAttachments` (optional): Minimum number
  - `fileTypes` (optional): Array like `['.pdf', '.docx']`
- **Use Case**: Invoice processing, document review

#### `urgency_threshold`
Fires when AI-detected urgency score meets threshold.
- **Config**:
  - `minScore`: Number (1-10)
- **Use Case**: High-priority notifications

#### `time_based`
Fires during specific time windows.
- **Config**:
  - `businessHoursOnly`: Boolean
  - `invertBusinessHours`: Boolean (fires outside business hours)
  - `delayMinutes` (optional): Delay after trigger
- **Use Case**: Out-of-office responders

---

## Conditions

Conditions filter which emails trigger bot actions. All conditions must pass (AND logic).

### Available Conditions

#### `sender_is_internal`
Check if sender is from your domain.
- **Config**: `{ domain: 'company.com' }`

#### `subject_contains`
Check subject line for keywords.
- **Config**: `{ keywords: ['urgent', 'asap'], matchAll: false }`

#### `body_contains`
Check email body for keywords.
- **Config**: `{ keywords: ['invoice', 'payment'], matchAll: true }`

#### `urgency_score_gte`
Check minimum urgency score.
- **Config**: `{ threshold: 7 }`

#### `email_is_unread`
Only process unread emails.
- **Config**: None

#### `received_within`
Only process recent emails.
- **Config**: `{ minutes: 120 }`

#### `has_attachment`
Check for attachments.
- **Config**: `{ required: true }`

---

## Actions

Actions define what the bot does. Bots can have multiple actions that execute sequentially.

### Available Actions

#### `create_draft`
Generate AI draft reply (safe - no auto-send).
- **Config**: `{ tone: 'professional' | 'casual' | 'formal' }`
- **Safety**: Always safe - requires manual review

#### `auto_send_email`
⚠️ Automatically send AI-generated reply.
- **Config**: `{ tone: 'professional', subject: '...' }`
- **Safety**: Requires terms acceptance
- **Premium**: Yes

#### `reply_with_template`
⚠️ Reply using predefined email template.
- **Config**: `{ templateId: '...', variables: {...} }`
- **Safety**: Requires terms acceptance

#### `apply_label`
Add Gmail label to email.
- **Config**: `{ labelName: 'Support', createIfMissing: true }`

#### `mark_as_read`
Mark email as read.
- **Config**: None

#### `notify_user`
Send in-app notification.
- **Config**: `{ message: '...', priority: 'high' }`

#### `forward_email`
Forward to another address.
- **Config**: `{ to: 'team@company.com', includeOriginal: true }`

---

## Safety Mechanisms

### Auto-Send Protection

Bots with auto-send actions (`auto_send_email`, `reply_with_template`) require explicit terms acceptance.

**Terms Acceptance Flow**:
1. Create bot with auto-send action
2. Enable bot → Terms modal appears
3. Review safety settings and terms
4. Accept → Bot activates

### Rate Limiting

#### Daily Send Limit (`maxSendsPerDay`)
Maximum emails bot can send in 24 hours.
- **Default**: 10
- **Recommended**: 10-50
- **Max**: 1000 (not recommended)

#### Cooldown (`cooldownMinutes`)
Minimum time between responses to same sender.
- **Default**: 60 minutes
- **Recommended**: 30-120 minutes
- **Prevents**: Spam and accidental loops

### Loop Prevention (`loopPrevention`)

Detects and blocks potential email loops:
- Tracks recent executions (last 30 minutes)
- Blocks if same sender + similar subject recently handled
- Automatically enabled for auto-send bots

### Safety Warnings

The system validates bot configuration and warns about:
- Auto-send without terms acceptance
- Very high daily limits (>1000)
- Very short cooldowns (<5 minutes)
- No conditions on broad triggers (danger zone)

---

## Bot Templates

5 pre-configured templates for common scenarios:

### 1. Customer Support Auto-Reply
- **Trigger**: Keywords in subject ('help', 'support', 'issue')
- **Action**: Create draft reply
- **Safety**: Drafts only (safe)

### 2. Sales Inquiry Handler
- **Trigger**: Keywords about pricing/demos
- **Action**: Auto-reply with calendar link
- **Safety**: Premium, requires terms
- **Use Case**: Automated lead response

### 3. Out-of-Office Responder
- **Trigger**: Outside business hours
- **Action**: Auto-reply with return date
- **Safety**: High daily limit (100), 24h cooldown

### 4. High Urgency Email Notifier
- **Trigger**: Urgency score ≥ 8
- **Action**: Push notification
- **Safety**: No sending, just alerts

### 5. Newsletter Auto-Archiver
- **Trigger**: Contains 'unsubscribe'
- **Action**: Apply label + mark as read
- **Safety**: Organization, no sending

---

## Creating Custom Bots

### Step-by-Step Guide

1. **Navigate to Bots Page** (`/bots`)
2. **Click "Create Bot"**
3. **Choose Template** (optional) or start from scratch
4. **Configure Trigger**
   - Select trigger type
   - Configure trigger settings
5. **Add Conditions** (optional)
   - Refine when bot activates
   - Use multiple conditions for precision
6. **Define Actions**
   - Add one or more actions
   - Order matters - actions execute sequentially
7. **Configure Safety**
   - Set daily limits
   - Configure cooldown
   - Enable loop prevention
8. **Review & Create**
   - Name your bot
   - Add description
   - Review configuration
   - Click "Create Bot"

### Bot is Created Disabled

All bots start disabled for safety. To activate:
1. Go to bot detail page
2. Click "Test Bot" to preview behavior
3. Click "Disabled" toggle
4. If auto-send: Accept terms modal
5. Bot is now enabled ✓

---

## Testing and Debugging

### Dry-Run Mode (Test Bot)

Preview what a bot would do without sending emails:

1. Open bot detail page
2. Click **"Test Bot"** button
3. View simulation results:
   - ✓/✗ Trigger matched
   - ✓/✗ Conditions passed
   - ✓/✗ Safety allowed
   - Planned actions list
   - Final result: Would execute?

**Mock Email**: Test uses a simulated email event. For better testing, use real sample emails when available.

### Execution Logs

Monitor all bot activity:
1. Bot detail page → **Execution Logs** tab
2. See every trigger attempt
3. Status indicators:
   - ✓ **Success**: Executed successfully
   - ✗ **Failure**: Execution error
   - ⚠️ **Safety Blocked**: Prevented by safety checks
4. View details:
   - Timestamp
   - Email sender/subject
   - Actions executed
   - Error messages (if any)

### Best Practices

1. **Test Before Enable**: Always use dry-run mode
2. **Start Conservative**: Low daily limits, high cooldowns
3. **Monitor Logs**: Check weekly for unexpected behavior
4. **Use Conditions**: Narrow trigger scope for precision
5. **Begin with Drafts**: Test workflow with `create_draft` first

---

## Troubleshooting

### Bot Not Triggering

**Problem**: Bot enabled but not executing

**Checklist**:
- ✓ Is bot enabled? (Check toggle on detail page)
- ✓ Does trigger match? (Use "Test Bot" to verify)
- ✓ Do conditions pass? (Check condition logic)
- ✓ Is safety blocking? (Check execution logs for "safety_blocked")
- ✓ Terms accepted? (Required for auto-send bots)

### Safety Blocked: Daily Limit Reached

**Solution**: Bot hit `maxSendsPerDay` limit
- Wait 24 hours for reset
- Or increase daily limit in bot settings (recreate bot)

### Safety Blocked: Cooldown Active

**Solution**: Bot tried to respond to same sender too soon
- Cooldown protects against spam
- Wait for cooldown period to expire
- Or reduce cooldown (if safe)

### Safety Blocked: Loop Detected

**Solution**: Bot detected potential email loop
- Review recent execution logs
- Check if multiple emails from same sender/subject in 30 min window
- Loop prevention is working correctly
- Disable loop prevention only if absolutely necessary

### Terms Not Accepted

**Problem**: Can't enable auto-send bot

**Solution**:
1. Open bot detail page
2. Click "Disabled" toggle to enable
3. Terms modal appears
4. Review terms and safety settings
5. Check "I have read and understand..."
6. Click "Accept Terms & Enable Bot"

### Actions Not Executing

**Problem**: Bot triggered but actions didn't run

**Check**:
1. Execution logs → Status
2. If "failure": Read error message
3. Common issues:
   - API rate limits (Gmail API)
   - Network errors
   - Template not found
   - Invalid configuration

### Email Not Sent (But Should Have)

**Checklist**:
1. Verify action type is `auto_send_email` or `reply_with_template`
2. Check `safety.autoSendEnabled` is `true`
3. Verify terms accepted (`acceptedTermsAt` set)
4. Check execution logs for "success" status
5. Check Gmail "Sent" folder
6. Verify not blocked by safety (daily limit, cooldown)

---

## API Reference

See `src/lib/bots/types.ts` for complete type definitions.

### Key Types
- `EmailBot`: Complete bot configuration
- `BotTrigger`: Trigger configuration
- `BotCondition`: Condition configuration
- `BotAction`: Action configuration
- `SafetyConfig`: Safety settings
- `BotExecutionLog`: Execution history record

---

## Support

For issues or questions:
1. Check this documentation
2. Review execution logs
3. Use "Test Bot" for debugging
4. Check system terms and safety guidelines

---

**Version**: 1.0  
**Last Updated**: 2026-01-31
