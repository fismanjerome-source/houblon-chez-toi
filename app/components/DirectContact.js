const PHONE_DISPLAY = '06 08 12 91 45';
const PHONE_TEL = '0608129145';
const WHATSAPP_NUMBER = '33608129145';
const EMAIL = 'contact@houbloncheztoi.fr';

const TXT = {
  fr: { title: 'Un peu de houblon chez toi ? Une question ?', subtitle: 'Un vrai contact, toujours disponible :' },
  nl: { title: 'Zin in Houblon chez toi? Een vraag?', subtitle: 'Een echt contact, altijd beschikbaar:' },
};

export default function DirectContact({ locale = 'fr' }) {
  const t = TXT[locale] || TXT.fr;
  return (
    <section className="wrap" style={{ padding: '8px 0 40px' }}>
      <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', borderRadius: 6, padding: '28px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: 'var(--pine)', margin: '0 0 6px' }}>
          {t.title}
        </h2>
        <p style={{ margin: '0 0 22px', color: 'rgba(var(--ink-rgb),0.7)', fontSize: 14.5 }}>
          {t.subtitle}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <a href={`tel:+33${PHONE_TEL.slice(1)}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            📞 {PHONE_DISPLAY}
          </a>
          <a href={`sms:${PHONE_TEL}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--pine)' }}>
            💬 SMS
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', borderColor: '#25D366', color: '#fff' }}
          >
            <WhatsAppIcon /> WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--pine)' }}>
            ✉️ {EMAIL}
          </a>
        </div>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Z"
        fill="#fff"
        opacity="0.15"
      />
      <path
        d="M16.7 14.2c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3Z"
        fill="#fff"
      />
    </svg>
  );
}
