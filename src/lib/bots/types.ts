/**
 * Email Bots System - Type Definitions
 * 
 * Core TypeScript interfaces and types for bot configuration,
 * triggers, conditions, actions, and execution tracking.
 */

// ============================================================================
// Core Bot Configuration
// ============================================================================

/**
 * Email automation bot configuration
 */
export interface EmailBot {
    // Identity
    id: string;
    userId: string;
    name: string;
    description?: string;
    prompt?: string;

    // Status
    enabled: boolean;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Configuration
    trigger: BotTrigger;
    conditions: BotCondition[];
    actions: BotAction[];

    // Safety
    safety: SafetyConfig;
    acceptedTermsAt?: Date;
    acceptedTermsVersion?: string;

    // Analytics
    stats: BotStats;

    // Follow-UP
    followUpConfig?: BotFollowUpConfig;

    // Knowledge Base
    policyConfig?: BotPolicyConfig;
}

// ============================================================================
// Triggers
// ============================================================================

export type TriggerType =
    | 'new_email_received'
    | 'email_from_sender'
    | 'email_contains_keyword'
    | 'email_contains_multiple_keywords' // NEW
    | 'email_contains_sentiment'       // NEW
    | 'email_with_attachment'
    | 'email_thread_inactive_for'      // NEW
    | 'thread_topic_changed'           // NEW
    | 'order_status_changed'           // NEW
    | 'refund_requested'               // NEW
    | 'previous_action_completed'      // NEW
    | 'external_webhook'
    | 'time_based'
    | 'urgency_threshold'
    | 'outgoing_email_sent'; // NEW: For Follow-Up Bot (Mode A)

export interface BotTrigger {
    type: TriggerType;
    config: TriggerConfig;
}

export type TriggerConfig =
    | NewEmailReceivedConfig
    | EmailFromSenderConfig
    | EmailContainsKeywordConfig
    | EmailContainsMultipleKeywordsConfig // NEW
    | EmailContainsSentimentConfig        // NEW
    | EmailWithAttachmentConfig
    | EmailThreadInactiveForConfig        // NEW
    | ThreadTopicChangedConfig            // NEW
    | OrderStatusChangedConfig            // NEW
    | RefundRequestedConfig               // NEW
    | PreviousActionCompletedConfig       // NEW
    | ExternalWebhookConfig
    | TimeBasedConfig
    | OutgoingEmailSentConfig // NEW
    | UrgencyThresholdConfig;

export interface OutgoingEmailSentConfig {
    excludeDomains?: string[];
    excludeKeywords?: string[];
    delayDegrees?: number; // Just placeholder, actual delay is in FollowUpConfig
}

export interface NewEmailReceivedConfig {
    // No config needed
}

export interface EmailFromSenderConfig {
    senderEmails: string[];
    matchMode: 'exact' | 'contains' | 'domain';
}

export interface EmailContainsKeywordConfig {
    keywords: string[];
    searchIn: 'subject' | 'body' | 'both';
}

export interface EmailContainsMultipleKeywordsConfig {
    keywords: string[];
    matchAll: boolean; // true = AND, false = OR (though standard keyword is OR usually)
    searchIn: 'subject' | 'body' | 'both';
}

export interface EmailContainsSentimentConfig {
    sentiment: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'urgent';
    minConfidence?: number; // 0-1
}

export interface EmailWithAttachmentConfig {
    minAttachments?: number;
    fileTypes?: string[]; // e.g., ['.pdf', '.docx']
}

export interface EmailThreadInactiveForConfig {
    hours?: number;
    days?: number;
    excludeIfReplied?: boolean;
}

export interface ThreadTopicChangedConfig {
    // Maybe sensitivity settings?
}

export interface OrderStatusChangedConfig {
    platform?: 'shopify' | 'woocommerce' | 'any';
    status: 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'any';
}

export interface RefundRequestedConfig {
    minAmount?: number;
}

export interface PreviousActionCompletedConfig {
    botId: string; // Could be self or other bot
    actionType: string;
}

export interface ExternalWebhookConfig {
    webhookId: string;
    eventType: string;
}

export interface TimeBasedConfig {
    schedule?: string; // Cron expression
    businessHoursOnly?: boolean;
    invertBusinessHours?: boolean; // Fire OUTSIDE business hours
    delayMinutes?: number;
}

export interface UrgencyThresholdConfig {
    minScore: number; // 1-10
}

// ============================================================================
// Conditions
// ============================================================================

export type ConditionType =
    | 'sender_is_internal'
    | 'sender_email_matches'
    | 'subject_contains'
    | 'body_contains'
    | 'urgency_score_gte'
    | 'email_is_unread'
    | 'received_within'
    | 'has_attachment'
    | 'thread_count_gte'
    | 'exclude_automated'; // NEW

export interface BotCondition {
    type: ConditionType;
    config: ConditionConfig;
}

export type ConditionConfig =
    | SenderIsInternalConfig
    | SenderEmailMatchesConfig
    | SubjectContainsConfig
    | BodyContainsConfig
    | UrgencyScoreGteConfig
    | EmailIsUnreadConfig
    | ReceivedWithinConfig
    | HasAttachmentConfig
    | ThreadCountGteConfig
    | ExcludeAutomatedConfig; // NEW

export interface SenderIsInternalConfig {
    domain: string; // e.g., 'yourcompany.com'
}

export interface SenderEmailMatchesConfig {
    pattern: string;
    matchType: 'exact' | 'contains' | 'regex';
}

export interface SubjectContainsConfig {
    keywords: string[];
    matchAll?: boolean; // AND vs OR
}

export interface BodyContainsConfig {
    keywords: string[];
    matchAll?: boolean;
}

export interface UrgencyScoreGteConfig {
    threshold: number; // 1-10
}

export interface EmailIsUnreadConfig {
    // No config needed
}

export interface ReceivedWithinConfig {
    minutes: number;
}

export interface HasAttachmentConfig {
    required: boolean;
}

export interface ThreadCountGteConfig {
    count: number;
}

export interface ExcludeAutomatedConfig {
    // No config needed usually, maybe strict mode?
    strict?: boolean;
}

// ============================================================================
// Actions
// ============================================================================

export type ActionType =
    | 'create_draft'
    | 'auto_send_email'
    | 'reply_with_template'
    | 'forward_email'
    | 'apply_label'
    | 'mark_as_read'
    | 'notify_user'
    | 'webhook_call';

export interface BotAction {
    type: ActionType;
    config: ActionConfig;
}

export type ActionConfig =
    | CreateDraftConfig
    | AutoSendEmailConfig
    | ReplyWithTemplateConfig
    | ForwardEmailConfig
    | ApplyLabelConfig
    | MarkAsReadConfig
    | NotifyUserConfig
    | WebhookCallConfig;

export interface CreateDraftConfig {
    tone?: 'professional' | 'casual' | 'formal';
    templateId?: string;
}

export interface AutoSendEmailConfig {
    tone?: 'professional' | 'casual' | 'formal';
    subject?: string;
    template?: string;
    acknowledgmentTemplate?: AcknowledgmentTemplate; // NEW: For auto-acknowledgment bots
}

export interface ReplyWithTemplateConfig {
    templateId: string;
    variables?: Record<string, string>;
}

export interface ForwardEmailConfig {
    to: string;
    includeOriginal: boolean;
}

export interface ApplyLabelConfig {
    labelName: string;
    createIfMissing?: boolean;
}

export interface MarkAsReadConfig {
    // No config needed
}

export interface NotifyUserConfig {
    message: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface WebhookCallConfig {
    url: string;
    method: 'GET' | 'POST';
    body?: Record<string, any>;
}

// ============================================================================
// Safety & Stats
// ============================================================================

export interface SafetyConfig {
    autoSendEnabled: boolean;
    maxSendsPerDay: number;
    cooldownMinutes: number;
    loopPrevention: boolean;
    requireApproval?: boolean;
    autoSendRules?: string[]; // NEW: Granular controls for E-Commerce (e.g., 'Customer_Support', 'Refunds')
}

export interface BotStats {
    totalExecutions: number;
    lastExecutedAt?: Date;
    successCount: number;
    failureCount: number;
    emailsSent: number;
    draftsCreated: number;
    lastUsedTemplate?: string; // NEW: Track last used template name
}

// ============================================================================
// Follow-Up System
// ============================================================================

export type FollowUpStatus = 'pending' | 'sent' | 'cancelled' | 'failed' | 'replied';

export interface MonitoredThread {
    id: string;
    bot_id: string;
    thread_id: string;
    subject: string;
    recipient: string;
    added_at: string; // ISO string from DB
    scheduled_for: string; // ISO string from DB
    status: FollowUpStatus;
    attempts: number;
    last_error?: string;
    metadata?: Record<string, any>; // NEW: Store original message info, etc.
}

export interface BotFollowUpConfig {
    enabled: boolean;
    mode: 'auto' | 'targeted'; // NEW
    settings: {
        delayValue: number;
        delayUnit: 'hours' | 'days';
        maxAttempts?: number;
        businessHoursOnly?: boolean;
        excludeDomains?: string[];
        excludeKeywords?: string[];
        // Whitelist for Targeted Mode
        includeRecipients?: string[]; // NEW: Specific emails/domains to watch

        // Auto-Acknowledgment Enhancements
        smartDelay?: boolean; // Calculate based on response_time + 1 unit

        // Follow-Up Content & Rules
        followUpTemplate?: AcknowledgmentTemplate; // NEW: The specific message to send
        maxFollowUps?: number; // NEW: Max number of nudges

        ignoreIfReplied?: boolean; // NEW: Cancel if recipient replies

        sendApology?: boolean;
        apologyTemplate?: AcknowledgmentTemplate;
        notifyUser?: boolean;
    };
    // Legacy support (optional)
    defaultDelayDays?: number;
    maxFollowUps?: number;
    excludeDomains?: string[];
}

// ============================================================================
// Knowledge Base (Policies)
// ============================================================================

export interface KnowledgeBasePolicy {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BotPolicyConfig {
    enabled: boolean;
    policies: KnowledgeBasePolicy[];
}

// ============================================================================
// Auto-Acknowledgment Templates
// ============================================================================

/**
 * Template for auto-acknowledgment emails
 */
export interface AcknowledgmentTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: TemplateVariable[];
    enabled: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Variable placeholder definition for templates
 */
export interface TemplateVariable {
    key: string;  // e.g., "response_time"
    label: string;  // e.g., "Expected Response Time"
    defaultValue: string;  // e.g., "3-5 business days"
    description?: string;  // Help text for users
}

// ============================================================================
// Execution Tracking
// ============================================================================

export interface BotExecutionLog {
    id: string;
    botId: string;
    emailId: string;
    triggeredAt: Date;
    status: 'success' | 'failure' | 'safety_blocked';
    actionsExecuted: string[];
    errorMessage?: string;
    metadata?: Record<string, any>;
}

export interface ActionResult {
    type: ActionType;
    success: boolean;
    data?: any;
    error?: string;
}

export interface SafetyResult {
    allowed: boolean;
    reason?: string;
}

// ============================================================================
// Email Event
// ============================================================================

export interface EmailEvent {
    type: 'new_email' | 'webhook' | 'thread_check' | 'action_completed';
    emailId: string;
    sender: {
        name: string;
        email: string;
    };
    subject: string;
    body: string;
    snippet?: string;
    date: string;
    read: boolean;
    urgencyScore?: number;
    threadId?: string;
    hasAttachment?: boolean;
    attachmentCount?: number;
    // For Webhooks / Special events
    payload?: any;
    previousContext?: string;
}
