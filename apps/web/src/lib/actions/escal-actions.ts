'use server';

import { getEscalEvents, getEscalMetrics, type EscalFilters } from '../escal-data-loader';

/**
 * Server Actions for Escal data
 * These can be called from client components
 */

export async function fetchEscalEvents(filters?: EscalFilters) {
  'use server';
  try {
    return getEscalEvents(filters);
  } catch (error) {
    console.error('[Escal Actions] Error fetching events:', error);
    throw error;
  }
}

export async function fetchEscalMetrics() {
  'use server';
  try {
    return getEscalMetrics();
  } catch (error) {
    console.error('[Escal Actions] Error fetching metrics:', error);
    throw error;
  }
}
