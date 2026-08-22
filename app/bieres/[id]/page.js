const { prisma } = require('../../../lib/db');
import Image from 'next/image';
import FlagIcon from '../../components/FlagIcon';
const { BEER_COLORS } = require('../../components/beerColors');
const { getLocale } = require('../../../lib/i18n');

export const dynamic = 'force-dynamic';

const TXT = {
  fr: {
    notFound: 'Bière introuvable',
    backToCatalogue: 'Retour au catalogue',
    back: '← Retour au catalogue',
    ourOpinion: '— notre avis',
    order: 'Commander cette bière',
    breweryWebsite: 'Site de la brasserie →',
    appearance: 'Robe', aroma: 'Nez', taste: 'Bouche', servingTemp: 'Température de service', foodPairing: 'Accords mets-bière',
    history: 'Histoire',
    glassesProposed: (n) => `Verre${n > 1 ? 's' : ''} proposé${n > 1 ? 's' : ''}`,
    bottleAlt: 'Bouteille', glassAlt: 'Verre',
  },
  nl: {
    notFound: 'Bier niet gevonden',
    backToCatalogue: 'Terug naar het aanbod',
    back: '← Terug naar het aanbod',
    ourOpinion: '— onze mening',
    order: 'Dit bier bestellen',
    breweryWebsite: 'Website van de brouwerij →',
    appearance: 'Uitzicht', aroma: 'Neus', taste: 'Mond', servingTemp: 'Schenktemperatuur', foodPairing: 'Bij dit bier past',
    history: 'Geschiedenis',
    glassesProposed: (n) => (n > 1 ? 'Voorgestelde glazen' : 'Voorgesteld glas'),
    bottleAlt: 'Fles', glassAlt: 'Glas',
  },
};

async function getBeer(id) {
  return prisma.beer.findUnique({
    where: { id },
    include: { glasses: { orderBy: { volumeCl: 'asc' } } },
  });
}

export async function generateMetadata({ params }) {
  const beer = await getBeer(params.id);
  const locale = getLocale();
  const t = TXT[locale] || TXT.fr;
  return { title: beer ? `${beer.name} — Houblon chez toi` : `${t.notFound} — Houblon chez toi` };
}

export default async function BeerPage({ params }) {
  const beer = await getBeer(params.id);
  const locale = getLocale();
  const t = TXT[locale] || TXT.fr;

  if (!beer) {
    return (
      <main className="wrap" style={{ padding: '48px 0' }}>
        <h1 style={{ color: 'var(--pine)' }}>{t.notFound}</h1>
        <a href="/#catalogue" className="btn" style={{ marginTop: 16, display: 'inline-block' }}>{t.backToCatalogue}</a>
      </main>
    );
  }

  const color = BEER_COLORS[beer.name] || 'var(--line)';
  const glasses = beer.glasses || [];
  const glassImage = (glasses.find((g) => g.imageUrl) || {}).imageUrl;
  const nl = locale === 'nl';
  const description = nl && beer.descriptionNl ? beer.descriptionNl : beer.description;
  const tastingNote = nl && beer.tastingNoteNl ? beer.tastingNoteNl : beer.tastingNote;
  const origin = nl && beer.originNl ? beer.originNl : beer.origin;
  const appearance = nl && beer.appearanceNl ? beer.appearanceNl : beer.appearance;
  const aroma = nl && beer.aromaNl ? beer.aromaNl : beer.aroma;
  const taste = nl && beer.tasteNl ? beer.tasteNl : beer.taste;
  const servingTemp = nl && beer.servingTempNl ? beer.servingTempNl : beer.servingTemp;
  const foodPairing = nl && beer.foodPairingNl ? beer.foodPairingNl : beer.foodPairing;
  const brewHistory = nl && beer.brewHistoryNl ? beer.brewHistoryNl : beer.brewHistory;

  return (
    <main className="wrap" style={{ padding: '40px 0 60px', maxWidth: 800 }}>
      <a href="/#catalogue" style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 12, color: 'var(--copper)', textDecoration: 'none' }}>
        {t.back}
      </a>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 20, marginBottom: 32 }}>
        {(beer.bottleImageUrl || glassImage) && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexShrink: 0, margin: '0 auto', width: 215 }}>
            <div className="zoom-on-hover" style={{ position: 'relative', width: 110, height: 310 }}>
              {beer.bottleImageUrl && (
                <Image src={beer.bottleImageUrl} alt={`${t.bottleAlt} ${beer.name}`} fill sizes="110px" style={{ objectFit: 'contain', objectPosition: 'bottom' }} />
              )}
            </div>
            <div className="zoom-on-hover" style={{ position: 'relative', width: 95, height: 310 }}>
              {glassImage && (
                <Image src={glassImage} alt={`${t.glassAlt} ${beer.name}`} fill sizes="95px" style={{ objectFit: 'contain', objectPosition: 'bottom' }} />
              )}
            </div>
          </div>
        )}

        <div style={{ flex: '1 1 320px', minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, color: 'var(--pine)', margin: 0 }}>{beer.name}</h1>
            <FlagIcon country={beer.country} size={22} />
          </div>
          <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 12.5, color: 'rgba(var(--ink-rgb),0.55)', marginBottom: 4 }}>
            {beer.brewery} — {origin}
          </div>
          {beer.abv > 0 && (
            <div style={{ display: 'inline-block', background: color, color: '#fff', fontFamily: 'Public Sans, sans-serif', fontSize: 12, padding: '3px 10px', borderRadius: 12, marginTop: 8 }}>
              {beer.abv}% vol.
            </div>
          )}

          <p style={{ fontSize: 15, color: 'rgba(var(--ink-rgb),0.8)', lineHeight: 1.65, marginTop: 18 }}>{description}</p>

          {tastingNote && (
            <p style={{ fontSize: 14, color: 'var(--copper)', fontStyle: 'italic', marginTop: 8 }}>
              « {tastingNote} » {t.ourOpinion}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <a href={`/#beer-${beer.id}`} className="btn">{t.order}</a>
            {beer.learnMoreUrl && (
              <a href={beer.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'transparent', color: 'var(--pine)' }}>
                {t.breweryWebsite}
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <TastingCard label={t.appearance} icon="👁️" text={appearance} />
        <TastingCard label={t.aroma} icon="👃" text={aroma} />
        <TastingCard label={t.taste} icon="👅" text={taste} />
        <TastingCard label={t.servingTemp} icon="🌡️" text={servingTemp} />
        <TastingCard label={t.foodPairing} icon="🍽️" text={foodPairing} />
      </div>

      {brewHistory && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, color: 'var(--pine)', marginBottom: 8 }}>{t.history}</h2>
          <p style={{ fontSize: 14, color: 'rgba(var(--ink-rgb),0.78)', lineHeight: 1.7 }}>{brewHistory}</p>
        </div>
      )}

      {glasses.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, color: 'var(--pine)', marginBottom: 12 }}>{t.glassesProposed(glasses.length)}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {glasses.map((g) => (
              <div key={g.id} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '10px 14px', fontSize: 13.5 }}>
                {g.name} — <span style={{ fontFamily: 'Public Sans, sans-serif' }}>{g.volumeCl}cl · {g.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function TastingCard({ label, icon, text }) {
  if (!text) return null;
  return (
    <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', borderRadius: 6, padding: 16 }}>
      <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, textTransform: 'uppercase', color: 'var(--copper)', marginBottom: 6 }}>
        {icon} {label}
      </div>
      <p style={{ fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.8)', lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}
