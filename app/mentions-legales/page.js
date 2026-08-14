export const metadata = { title: 'Mentions légales — Houblon chez toi' };

export default function MentionsLegalesPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Mentions légales</h1>

      <div style={{ background: '#FBF0E0', border: '1px solid var(--amber)', borderRadius: 6, padding: 16, margin: '20px 0', fontSize: 13.5 }}>
        ⚠️ L'entreprise Houblon chez toi est en cours de création — le statut juridique et le numéro SIRET
        seront ajoutés ici dès l'immatriculation effective. Les champs restants entre crochets doivent être
        complétés avant toute mise en ligne réelle. Les mentions légales sont obligatoires en France pour
        tout site marchand (article 6-III de la LCEN).
      </div>

      <Section title="Éditeur du site">
        [Nom de l'entreprise ou nom et prénom si vous êtes auto-entrepreneur]<br />
        [Statut juridique — entreprise en cours de création]<br />
        984 Avenue du Général de Gaulle, 59910 Bondues<br />
        [Numéro SIRET — à venir]<br />
        [Numéro de TVA intracommunautaire, si applicable]<br />
        Email : contact@houbloncheztoi.fr<br />
        Téléphone : 06 08 12 91 45
      </Section>

      <Section title="Directeur de la publication">
        [Nom et prénom du responsable de la publication]
      </Section>

      <Section title="Hébergement">
        Ce site est hébergé par :<br />
        Vercel Inc.<br />
        340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pine)' }}>vercel.com</a>
      </Section>

      <Section title="Données personnelles">
        Les données collectées via ce site (nom, email, adresse, historique de commandes) sont utilisées
        uniquement dans le cadre de la gestion des comptes clients et des commandes. Conformément au RGPD,
        vous disposez d'un droit d'accès, de rectification et de suppression de vos données, à exercer en
        écrivant à [votre email de contact].
      </Section>

      <Section title="Propriété intellectuelle">
        L'ensemble des contenus de ce site (textes, visuels, logo) est la propriété de [nom de l'entreprise],
        sauf mention contraire. Les photographies de produits restent la propriété de leurs brasseries
        respectives.
      </Section>

      <Section title="Consommation responsable">
        L'abus d'alcool est dangereux pour la santé. À consommer avec modération. La vente d'alcool est
        interdite aux mineurs de moins de 18 ans.
      </Section>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 17, color: 'var(--pine)', marginBottom: 6 }}>{title}</h2>
      <p style={{ color: 'rgba(15,23,18,0.75)', lineHeight: 1.7, fontSize: 14.5 }}>{children}</p>
    </section>
  );
}
