// app/terms/page.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import TermsAcceptanceStatus from "@/components/terms-acceptance-status";

export default function TermsPage() {
  return (
    <div className=" bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <TermsAcceptanceStatus />
        <Card className="border bg-white">
          <CardContent className="p-6 sm:p-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="text-2xl sm:text-3xl font-bold mb-8">
                Termini di Servizio
              </h1>

              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    1. Introduzione
                  </h2>
                  <p>
                    Benvenuto su Appunti - Liceo Aprosio (&quot;il
                    Servizio&quot;). Utilizzando il nostro servizio, accetti di
                    essere vincolato dai seguenti termini di servizio
                    (&quot;Termini&quot;). Si prega di leggerli attentamente.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">2. Definizioni</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      &quot;Servizio&quot; si riferisce alla piattaforma Appunti
                      - Liceo Aprosio
                    </li>
                    <li>
                      &quot;Utente&quot; si riferisce a qualsiasi persona che
                      accede o utilizza il Servizio
                    </li>
                    <li>
                      &quot;Contenuto&quot; si riferisce a qualsiasi materiale
                      caricato dagli utenti sulla piattaforma
                    </li>
                    <li>
                      &quot;Proprietario&quot; si riferisce al proprietario e
                      gestore del Servizio
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    3. Ruolo della Piattaforma
                  </h2>
                  <p>
                    Il Servizio agisce esclusivamente come piattaforma tecnica
                    per permettere agli studenti di condividere appunti e
                    materiali di studio. Il Proprietario non crea, modifica,
                    controlla o verifica i contenuti caricati dagli utenti.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    4. Gestione dell&apos;Identità e Autenticazione
                  </h2>
                  <p>
                    L&apos;autenticazione e la gestione dell&apos;identità degli
                    utenti è fornita da Clerk (
                    <a
                      href="https://clerk.com"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://clerk.com
                    </a>
                    ). Utilizzando il nostro servizio, accetti anche i{" "}
                    <a
                      href="https://clerk.com/terms"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Termini di Servizio di Clerk
                    </a>{" "}
                    e la loro{" "}
                    <a
                      href="https://clerk.com/privacy"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    5. Visibilità e Privacy dell&apos;Utente
                  </h2>
                  <p>
                    Accetti che il tuo nome utente possa essere visualizzato
                    pubblicamente sul Servizio. Tuttavia, hai il diritto di:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Scegliere di rimanere anonimo quando carichi appunti
                    </li>
                    <li>
                      Optare per non apparire nella classifica della piattaforma
                    </li>
                    <li>
                      Modificare queste preferenze in qualsiasi momento dalle
                      impostazioni del tuo account
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    6. Esonero di Responsabilità
                  </h2>
                  <p>
                    Il Proprietario è esonerato da qualsiasi responsabilità
                    relativa a:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Accuratezza, completezza o affidabilità dei contenuti
                      caricati dagli utenti
                    </li>
                    <li>
                      Eventuali errori o omissioni nei materiali condivisi
                    </li>
                    <li>
                      Violazioni di copyright o proprietà intellettuale da parte
                      degli utenti
                    </li>
                    <li>
                      Utilizzo improprio dei materiali da parte degli utenti
                    </li>
                    <li>
                      Danni diretti o indiretti derivanti dall&apos;utilizzo del
                      Servizio
                    </li>
                    <li>Perdita di dati o interruzioni del servizio</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    7. Responsabilità dell&apos;Utente
                  </h2>
                  <p>L&apos;Utente si assume piena responsabilità per:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      L&apos;accuratezza e la veridicità dei contenuti caricati
                    </li>
                    <li>Il rispetto dei diritti di proprietà intellettuale</li>
                    <li>L&apos;utilizzo appropriato e legale del Servizio</li>
                    <li>La sicurezza delle proprie credenziali di accesso</li>
                    <li>
                      Qualsiasi conseguenza derivante dall&apos;uso dei
                      materiali scaricati
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    8. Proprietà Intellettuale
                  </h2>
                  <p>Caricando contenuti sul Servizio, l&apos;Utente:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Garantisce di essere l&apos;autore del contenuto o di
                      avere il diritto di condividerlo
                    </li>
                    <li>Mantiene i propri diritti sul contenuto</li>
                    <li>
                      Concede al Servizio una licenza non esclusiva per ospitare
                      e rendere disponibile il contenuto
                    </li>
                    <li>
                      Si impegna a non caricare materiale protetto da copyright
                      senza autorizzazione
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    9. Protezione dei Dati
                  </h2>
                  <p>
                    Il trattamento dei dati personali avviene in conformità con:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Il Regolamento Generale sulla Protezione dei Dati (GDPR)
                    </li>
                    <li>
                      Il D.Lgs. 196/2003 (Codice Privacy) e successive modifiche
                    </li>
                    <li>La normativa italiana vigente in materia di privacy</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    10. Modifiche ai Termini
                  </h2>
                  <p>
                    Il Proprietario si riserva il diritto di modificare questi
                    Termini in qualsiasi momento. Le modifiche saranno effettive
                    immediatamente dopo la pubblicazione sul Servizio.
                    L&apos;utilizzo continuato del Servizio dopo tali modifiche
                    costituisce accettazione dei nuovi Termini.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    11. Legge Applicabile
                  </h2>
                  <p>
                    Questi Termini sono regolati dalla legge italiana. Qualsiasi
                    controversia sarà soggetta alla giurisdizione esclusiva del
                    foro di [inserire foro competente].
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">12. Contatti</h2>
                  <p>
                    Per qualsiasi domanda riguardante questi Termini,
                    contattare: appunti.liceo.aprosio@gmail.com
                  </p>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
