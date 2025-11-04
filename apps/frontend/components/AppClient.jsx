"use client";
import React from 'react';
import useRevealOnScroll from '../hooks/useRevealOnScroll';
import { HealthAPI } from '../lib/api';

// Global client-side effects: reveal-on-scroll + API health ping
export default function AppClient() {
  useRevealOnScroll();

  React.useEffect(() => {
    HealthAPI.ping()
      .then((res) => {
        // eslint-disable-next-line no-console
        console.info('API online:', res.data);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('API offline:', err?.message || err);
      });
  }, []);

  return null;
}
