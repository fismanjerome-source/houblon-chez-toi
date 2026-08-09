export const metadata = { title: 'CGU — Houblon chez toi' };

export default function CguPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Conditions générales d'utilisation et de vente</h1>

      <div style={{ background: '#FBF0E0', border: '1px solid var(--amber)', borderRadius: 6, padding: 16, margin: '20px 0', fontSize: 13.5 }}>
        ⚠️ Ce texte est un modèle générique de départ, pas un document juridique validé. Faites-le relire par
        un professionnel (avocat, expert-comptable, ou CCI) avant toute mise en ligne réelle du site.
      </div>

      <Section title="1. Objet">
        Les présentes conditions régissent la vente de bières et produits associés proposée par Houblon chez toi
        aux particuliers et professionnels via ce site, ainsi que la livraison dans son secteur de distribution.
      </Section>

      <Section title="2. Vérification de l'âge">
        La vente d'alcool est interdite aux mineurs. En passant commande, le client certifie être âgé de 18 ans
        ou plus. Une pièce d'identité pourra être demandée à la livraison.
      </Section>

      <Section title="3. Commandes">
        Les commandes sont passées via le site, après création d'un compte. Le client choisit ses produits,
        une commune de livraison et un créneau parmi ceux proposés. Une commande n'est confirmée qu'après
        validation par Houblon chez toi.
      </Section>

      <Section title="4. Prix">
        Les prix sont indiqués en euros, toutes taxes comprises. Houblon chez toi se réserve le droit de
        modifier ses prix à tout moment ; les commandes déjà validées ne sont pas affectées.
      </Section>

      <Section title="5. Livraison">
        La livraison est assurée sur le créneau et dans la commune choisis par le client au moment de la
        commande, dans la limite du secteur desservi.
      </Section>

      <Section title="6. Paiement">
        Les modalités de paiement seront précisées lors de la commande (paiement en ligne à venir).
      </Section>

      <Section title="7. Rétractation">
        Conformément à la réglementation, le droit de rétractation peut être limité pour les denrées
        périssables ou rapidement consommables. Les modalités applicables seront précisées avant la mise
        en service du paiement en ligne.
      </Section>

      <Section title="8. Données personnelles">
        Les informations collectées (nom, email, adresse) servent uniquement à la gestion des commandes et
        comptes clients. Voir nos mentions légales pour le contact relatif aux données personnelles.
      </Section>

      <Section title="9. Consommation responsable">
        L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
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
