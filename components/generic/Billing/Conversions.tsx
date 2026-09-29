/* eslint-disable prefer-rest-params */

'use client';

import { useEffect } from 'react';

/**
 * Reports a completed purchase to GA4, Google Ads and the X (Twitter) pixel.
 *
 * `amount` is in cents, straight off the Stripe intent. `reference` is the Stripe intent id, which
 * is stable for a given purchase, so every destination uses it to recognise the same conversion
 * being reported twice (a refresh of the success page, for instance) instead of booking it again.
 *
 * Both values matter for bidding, not just reporting: without an amount the platforms cannot tell a
 * $5 monthly from a $49 API plan and optimise toward whichever is cheapest to win.
 *
 * Note that the Ads and GA4 sends are separate calls on purpose. `send_to` restricts an event to the
 * destinations it names, so the Ads conversion never reaches GA4 and a GA4 purchase never reaches
 * Ads. If the GA4 purchase is ever imported into Google Ads as a conversion action it will double
 * count against the Ads pixel below, so import it as a secondary ("observation") action only.
 */
const Conversions = (
  { amount = 0, reference = null }:
  { amount?: number; reference?: string | null; },
) => {
  useEffect(() => {
    // A setup intent carries no amount (nothing is charged up front), so only send a value when
    // there is one. A zero would tell the platforms the sale was worthless, which is worse than
    // sending nothing at all.
    const value = amount > 0 ? +(amount / 100).toFixed(2) : null;


    // Ensure the global dataLayer exists, even if Next.js hasn't loaded the script yet
    // @ts-expect-error foo
    window.dataLayer = window.dataLayer || [];

    // Safely stub the gtag function to queue events if it's missing
    // @ts-expect-error foo
    if (!window.gtag) {
      // @ts-expect-error foo
      window.gtag = function () { window.dataLayer.push(arguments); };
    }

    // @ts-expect-error gtag is added on root
    if (window.gtag && typeof window.gtag === 'function') {
      const adsPayload: Record<string, unknown> = {
        send_to: 'AW-11331182972/inE2CJzSjYsdEPzCkJsq',
      };

      // GA4 reports revenue through the standard ecommerce purchase event, not through the Ads
      // conversion above, which never reaches it.
      const ga4Payload: Record<string, unknown> = {
        send_to: 'G-S67JFT2KZW',
      };

      if (value !== null) {
        adsPayload.value = value;
        adsPayload.currency = 'USD';
        ga4Payload.value = value;
        ga4Payload.currency = 'USD';
      }

      // Google's de-duplication key, on both destinations.
      if (reference) {
        adsPayload.transaction_id = reference;
        ga4Payload.transaction_id = reference;
      }

      // @ts-expect-error gtag is added on root
      window.gtag('event', 'conversion', adsPayload);
      // @ts-expect-error gtag is added on root
      window.gtag('event', 'purchase', ga4Payload);
    }

    // @ts-expect-error twq is added on root
    if (window.twq && typeof window.twq === 'function') {
      const payload: Record<string, unknown> = {};

      if (value !== null) {
        payload.value = value;
        payload.currency = 'USD';
      }

      // X's de-duplication key. It has to be stable per purchase, so it cannot be generated here.
      if (reference) {
        payload.conversion_id = reference;
      }

      // @ts-expect-error twq is added on root
      window.twq('event', 'tw-qltj2-qltj6', payload);
    }
    // Deliberately fires once on mount. Status only renders this component after the intent has
    // resolved, so amount and reference are already final, and re-firing would double count.
  }, []);

  return null;
};

export default Conversions;
