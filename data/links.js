// Links used on the page. Member login opens a modal (components/ApplyModal.jsx) - TODO: connect it to the platform auth.
export const PRIVACY_URL = 'https://legends.app/privacy';
export const TERMS_URL = 'https://legends.app/terms';
export const CONTACT_PHONE = '+357 97 916299';

// Analytics / CRM hook (GTM dataLayer). Event: 'application_submitted'.
export const track = (event, data = {}) => {
  try { (window.dataLayer = window.dataLayer || []).push({ event, ...data }); } catch {}
};
