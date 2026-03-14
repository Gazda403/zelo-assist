/**
 * Email Bots System - Analysis Engine
 * 
 * Provides intent classification and risk scoring for bot telemetry.
 */

import { EmailEvent } from '../types';

export type IntentType =
    | 'User_Support'
    | 'Cold_Sales'
    | 'Investor_Outreach'
    | 'Hiring'
    | 'Meeting_Request'
    | 'Legal_Finance'
    | 'Order_Status'
    | 'Return_Request'
    | 'Product_Inquiry'
    | 'Complaint'
    | 'Shipping_Question'
    | 'Other';

export interface AnalysisResult {
    intent: IntentType;
    riskScore: number;
    isSpam: boolean;
}

/**
 * Perform AI-less heuristic analysis (First pass)
 */
export function analyzeEmailTelemetry(event: EmailEvent): AnalysisResult {
    const text = (event.subject + ' ' + (event.body || event.snippet || '')).toLowerCase();
    const sender = event.sender.email.toLowerCase();

    let intent: IntentType = 'Other';
    let riskScore = 0;
    let isSpam = false;

    // 1. Intent Detection (Heuristic)
    if (text.includes('order') && (text.includes('status') || text.includes('where') || text.includes('track'))) {
        intent = 'Order_Status';
    } else if (text.includes('return') || text.includes('refund') || text.includes('exchange')) {
        intent = 'Return_Request';
    } else if (text.includes('product') || text.includes('stock') || text.includes('available') || text.includes('size') || text.includes('color')) {
        intent = 'Product_Inquiry';
    } else if (text.includes('shipping') || text.includes('delivery') || text.includes('ship')) {
        intent = 'Shipping_Question';
    } else if (text.includes('complaint') || text.includes('angry') || text.includes('disappointed') || text.includes('terrible')) {
        intent = 'Complaint';
    }
    else if (text.includes('support') || text.includes('help') || text.includes('issue') || text.includes('broken')) {
        intent = 'User_Support';
    } else if (text.includes('invest') || text.includes('funding') || text.includes('seed') || text.includes('pitch')) {
        intent = 'Investor_Outreach';
    } else if (text.includes('hire') || text.includes('job') || text.includes('resume') || text.includes('career')) {
        intent = 'Hiring';
    } else if (text.includes('meeting') || text.includes('schedule') || text.includes('calendar') || text.includes('zoom')) {
        intent = 'Meeting_Request';
    } else if (text.includes('legal') || text.includes('contract') || text.includes('invoice') || text.includes('payment')) {
        intent = 'Legal_Finance';
    }

    // 2. Cold Sales / Spam Detection
    const coldSalesKeywords = ['growth', 'marketing', 'leads', 'seo', 'optimization', 'partnership opportunity', 'guest post'];
    if (coldSalesKeywords.some(kw => text.includes(kw))) {
        intent = 'Cold_Sales';
        isSpam = true;
        riskScore += 20;
    }

    // 3. Risk Scoring
    const highRiskKeywords = ['urgent', 'important', 'sue', 'breach', 'audit', 'lawsuit', 'overdue'];
    highRiskKeywords.forEach(kw => {
        if (text.includes(kw)) riskScore += 30;
    });

    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = sender.split('@')[1];
    if (domain && freeDomains.includes(domain)) {
        riskScore += 10;
    }

    if (event.urgencyScore) {
        riskScore += event.urgencyScore * 5;
    }

    return {
        intent,
        riskScore: Math.min(riskScore, 100),
        isSpam
    };
}
