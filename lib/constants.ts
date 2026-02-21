// lib/constants.ts

// Column detection
export const DIMENSION_MIN_UNIQUE = 2;
export const DIMENSION_MAX_UNIQUE = 40;
export const COLUMN_SAMPLE_SIZE = 100;

// Variance analysis
export const MIN_TOUCHES_THRESHOLD = 20;
export const VARIANCE_STRONG = 3;
export const VARIANCE_MODERATE = 1.5;

// Drop-off recovery
export const RECOVERY_RATE = 0.1;

// Concentration risk
export const CONCENTRATION_RISK_THRESHOLD = 0.5;

// Metric color thresholds
export const MEETING_RATE_GREEN = 15;
export const MEETING_RATE_RED = 5;
export const PIPELINE_PER_TOUCH_GREEN = 10000;
export const PIPELINE_PER_TOUCH_RED = 2000;
export const MTG_TO_OPP_GREEN = 70;
export const MTG_TO_OPP_RED = 50;

// Dashboard limits
export const MAX_DASHBOARDS = 10;
export const MAX_AI_MESSAGES = 40;
export const MAX_API_MESSAGES = 50;
export const MAX_CONTEXT_LENGTH = 200_000;
