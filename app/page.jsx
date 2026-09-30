import Globe from '@/components/Globe';
import ApplyModal, { ApplyButton } from '@/components/ApplyModal';
import { PRIVACY_URL, TERMS_URL, CONTACT_PHONE } from '@/data/links';

const Arr = () => <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

const PILLARS = ['Online by sector', 'In person by city', 'Connected through our platform'];

export default function Home() {
  return (
    <div className="gate">
      <Globe />
      <header className="g-top">
        <a className="g-brand" href="/"><img src="/brand/symbol.png" alt="" /><span><b>LEGENDS</b><small>PRIVATE INVESTORS NETWORK</small></span></a>
        <ApplyButton mode="login" className="g-login"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>Member login</ApplyButton>
      </header>

      <main className="g-main">
        <span className="g-rule" aria-hidden="true" />
        <p className="g-kicker">Investors only</p>
        <h1>Private Investors<br /><em>Network</em></h1>
        <p className="g-lead"><span>Rare, high-quality deals from investors.</span> <span>Co-investment. Additional capital. Private events.</span></p>
        <div className="g-cta">
          <ApplyButton className="g-btn">Apply to join <Arr /></ApplyButton>
          <span className="g-note"><i />Membership by approval</span>
        </div>
      </main>

      <section className="g-pillars" aria-label="How Legends works">
        {PILLARS.map((t) => <span key={t} className="g-pill">{t}</span>)}
      </section>

      <footer className="g-foot">
        <span>© 2026 AVELYTH PLATFORM LTD</span>
        <nav><a href={'tel:' + CONTACT_PHONE.replace(/\s/g, '')}>Contact</a><a href={PRIVACY_URL}>Privacy</a><a href={TERMS_URL}>Terms</a></nav>
      </footer>

      <ApplyModal />
    </div>
  );
}
