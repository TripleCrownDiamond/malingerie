"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

type CookieConsent = "accepted" | "essential" | "rejected";

const COOKIE_CONSENT_KEY = "mpl_cookie_consent";
const AGE_CONSENT_KEY = "mpl_age_consent";
const ONE_YEAR_IN_DAYS = 365;

function setClientCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function readClientCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const found = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));

  if (!found) {
    return null;
  }

  return decodeURIComponent(found.split("=").slice(1).join("="));
}

function toCookieConsent(value: string | null): CookieConsent | null {
  if (value === "accepted" || value === "essential" || value === "rejected") {
    return value;
  }

  return null;
}

export function ConsentBanners() {
  const isClientReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const [ageAcceptedOverride, setAgeAcceptedOverride] = useState<boolean | null>(null);
  const [cookieConsentOverride, setCookieConsentOverride] = useState<CookieConsent | null | undefined>(undefined);

  const storedAgeAccepted =
    isClientReady && (localStorage.getItem(AGE_CONSENT_KEY) ?? readClientCookie(AGE_CONSENT_KEY)) === "yes";

  const storedCookieConsent =
    isClientReady
      ? toCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY) ?? readClientCookie(COOKIE_CONSENT_KEY))
      : null;

  const ageAccepted = ageAcceptedOverride ?? storedAgeAccepted;
  const cookieConsent = cookieConsentOverride === undefined ? storedCookieConsent : cookieConsentOverride;

  const showAgeBanner = isClientReady && !ageAccepted;
  const showCookieBanner = isClientReady && !showAgeBanner && cookieConsent === null;

  function acceptAgeConsent() {
    localStorage.setItem(AGE_CONSENT_KEY, "yes");
    setClientCookie(AGE_CONSENT_KEY, "yes", ONE_YEAR_IN_DAYS);
    setAgeAcceptedOverride(true);
  }

  function leaveBecauseUnderAge() {
    window.location.href = "https://www.google.com";
  }

  function saveCookieConsent(consent: CookieConsent) {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    setClientCookie(COOKIE_CONSENT_KEY, consent, ONE_YEAR_IN_DAYS);
    setCookieConsentOverride(consent);
  }

  return (
    <>
      {showAgeBanner ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-white p-7 shadow-2xl sm:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Verification d&apos;age</p>
            <h2 className="mt-3 font-display text-3xl text-[var(--ink)]">Ce site est reserve aux adultes</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              En entrant, vous confirmez avoir au moins 18 ans et accepter de consulter du contenu reserve a un public majeur.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={acceptAgeConsent}
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--accent-strong)]"
              >
                J&apos;ai 18 ans ou plus
              </button>
              <button
                type="button"
                onClick={leaveBecauseUnderAge}
                className="rounded-full border border-[var(--line)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[var(--accent)]"
              >
                Quitter le site
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCookieBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[var(--line)] bg-white/98 px-4 py-4 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Cookies</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Nous utilisons des cookies pour mesurer l&apos;audience et personnaliser votre experience. Vous pouvez modifier votre choix a tout moment.
                <span className="ml-1">
                  <Link href="/politique-cookies" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
                    Voir la politique cookies
                  </Link>
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => saveCookieConsent("essential")}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)] transition hover:border-[var(--accent)]"
              >
                Essentiels uniquement
              </button>
              <button
                type="button"
                onClick={() => saveCookieConsent("rejected")}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)] transition hover:border-[var(--accent)]"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => saveCookieConsent("accepted")}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[var(--accent-strong)]"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}