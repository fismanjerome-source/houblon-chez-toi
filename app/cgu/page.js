export const metadata = { title: 'CGU — Houblon chez toi' };

export default function CguPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Conditions générales d'utilisation et de vente</h1>

      <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--amber)', borderRadius: 2, padding: 16, margin: '20px 0', fontSize: 13.5 }}>
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
        La livraison est assurée du lundi au vendredi de 18h à 19h30, et le samedi de 10h à 12h (pas de
        livraison le dimanche), dans la commune choisie par le client et dans la limite du secteur desservi.
        Une commande passée avant 15h peut être livrée dès le jour même, selon disponibilité ; passée
        après 15h, elle est livrée à partir du lendemain. Les commandes passées le dimanche sont traitées
        à partir du lundi. Le client peut également opter pour un retrait sur place à Bondues.
      </Section>

      <Section title="6. Paiement">
        Le paiement en ligne par carte bancaire (Stripe) sera proposé prochainement. En attendant, le
        règlement se fait en espèces à la livraison ou au retrait de la commande.
      </Section>

      <Section title="7. Rétractation">
        Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique
        pas aux biens susceptibles de se détériorer ou de se périmer rapidement, ni aux boissons dont le prix
        dépend de fluctuations du marché. En cas de produit livré non conforme ou défectueux, contactez-nous
        (voir la page Contact) pour un échange ou un remboursement.
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
      <p style={{ color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.7, fontSize: 14.5 }}>{children}</p>
    </section>
  );
}
