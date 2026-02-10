'use server';

import { getClubguideEvents, getClubguideMetrics, type ClubguideFilters } from '../clubguide-data-loader';

/**
 * Server Actions for Clubguide data
 * These can be called from client components
 */

export async function fetchClubguideEvents(filters?: ClubguideFilters) {
  'use server';
  try {
    return getClubguideEvents(filters);
  } catch (error) {
    console.error('[Clubguide Actions] Error fetching events:', error);
    throw error;
  }
}

export async function fetchClubguideMetrics() {
  'use server';
  try {
    return getClubguideMetrics();
  } catch (error) {
    console.error('[Clubguide Actions] Error fetching metrics:', error);
    throw error;
  }
}
