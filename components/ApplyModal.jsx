'use client';
import { useEffect, useRef, useState } from 'react';
import { PRIVACY_URL, TERMS_URL, track } from '@/data/links';

const OPEN = 'legends:apply';
const LOGIN = 'legends:login';

// Any button can open the modal.
export function ApplyButton({ className, children, mode = 'apply' }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(mode === 'login' ? LOGIN : OPEN))}>{children}</button>;
}

// Apply modal (same flow as belegends.club): short form -> "Application submitted".
// Prototype: no backend yet. TODO: send `data` to the CRM / API in onSubmit.
export default function ApplyModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('apply');
  const [loginMsg, setLoginMsg] = useState('');
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const o = () => { setMode('apply'); setDone(false); setOpen(true); };
    const l = () => { setMode('login'); setLoginMsg(''); setOpen(true); };
    window.addEventListener(OPEN, o); window.addEventListener(LOGIN, l);
    return () => { window.removeEventListener(OPEN, o); window.removeEventListener(LOGIN, l); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    setTimeout(() => box.current?.querySelector('input,button')?.focus(), 60);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', key); };
  }, [open, mode]);

  const onSubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSending(true);
    track('application_submitted', { source: 'legends.app' });
    setTimeout(() => { setSending(false); setDone(true); }, 500); // TODO: POST data to CRM
  };

  // Member login. TODO: connect to the platform auth (LOGIN_URL / API) - prototype shows a notice.
  const onLogin = (e) => {
    e.preventDefault();
    setLoginMsg('Member access is being set up. We’ll email members as soon as the platform opens.');
  };

  if (!open) return null;
  return (
    <div className="am" role="dialog" aria-modal="true" aria-labelledby="am-t" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="am-box" ref={box}>
        <button type="button" className="am-x" aria-label="Close" onClick={() => setOpen(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
        {mode === 'login' ? (
          <>
            <p className="am-k">Members</p>
            <h2 id="am-t">Member login</h2>
            <p className="am-sub">Sign in with the email you used for your membership.</p>
            <form className="am-f" onSubmit={onLogin}>
              <label className="am-field"><span>Email</span><input name="email" type="email" required placeholder="you@company.com" autoComplete="email" /></label>
              <label className="am-field"><span>Password</span><input name="password" type="password" required placeholder="••••••••" autoComplete="current-password" /></label>
              <a className="am-forgot" href="mailto:concierge@belegends.club?subject=Password%20reset">Forgot password?</a>
              {loginMsg && <p className="am-msg" role="status">{loginMsg}</p>}
              <button className="am-submit dark" type="submit">Sign in</button>
              <p className="am-legal">Not a member yet? <button type="button" className="am-link" onClick={() => { setMode('apply'); setDone(false); }}>Apply to join</button></p>
            </form>
          </>
        ) : done ? (
          <div className="am-done">
            <span className="am-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12l5 5 9-10" /></svg></span>
            <h2 id="am-t">Application submitted</h2>
            <p>We’ll review your application and be in touch within 72 hours.</p>
            <button type="button" className="am-submit" onClick={() => setOpen(false)}>Close</button>
          </div>
        ) : (
          <>
            <p className="am-k">Membership by approval</p>
            <h2 id="am-t">Apply to join Legends</h2>
            <p className="am-sub">Tell us about yourself - we’ll review and be in touch.</p>
            <form className="am-f" onSubmit={onSubmit}>
              <label className="am-field"><span>Full name <b>*</b></span><input name="name" required placeholder="Your full name" autoComplete="name" /></label>
              <label className="am-field"><span>Email <b>*</b></span><input name="email" type="email" required placeholder="you@company.com" autoComplete="email" /></label>
              <label className="am-field"><span>Phone (with country code) <b>*</b></span><input name="phone" type="tel" required placeholder="+971 50 000 0000" autoComplete="tel" /></label>
              <label className="am-field"><span>LinkedIn URL <em>(optional)</em></span><input name="linkedin" type="text" placeholder="linkedin.com/in/..." /></label>
              <label className="am-check"><input type="checkbox" name="consent" /><span>Legends may contact me by phone, SMS, and messaging apps about my application, events, and related offers, and such calls may be recorded. I can withdraw at any time. <em>(Optional)</em></span></label>
              <button className="am-submit" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Submit · We’ll review & be in touch →'}</button>
              <p className="am-legal">By submitting, you agree to our <a href={TERMS_URL}>Terms</a> &amp; <a href={PRIVACY_URL}>Privacy</a>.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
