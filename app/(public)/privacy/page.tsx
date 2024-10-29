// app/privacy/page.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import TermsAcceptanceStatus from "@/components/terms-acceptance-status";

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <TermsAcceptanceStatus />
        <Card className="border bg-white">
          <CardContent className="p-6 sm:p-8">
            <div className="prose prose-gray max-w-none">
              <h1 className="text-2xl sm:text-3xl font-bold mb-8">
                Privacy Policy
              </h1>

              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    1. Informazioni Generali
                  </h2>
                  <p>
                    La presente Privacy Policy descrive le modalità di raccolta,
                    utilizzo e protezione dei dati personali degli utenti di
                    Appunti - Liceo Aprosio (&quot;il Servizio&quot;).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    2. Dati Raccolti
                  </h2>
                  <p>Raccogliamo i seguenti tipi di dati:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Dati di registrazione:</strong> nome, email, e
                      altre informazioni fornite durante la registrazione
                    </li>
                    <li>
                      <strong>Dati di utilizzo:</strong> informazioni sulle
                      interazioni con il servizio
                    </li>
                    <li>
                      <strong>Contenuti caricati:</strong> appunti e materiali
                      condivisi sulla piattaforma
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    3. Finalità del Trattamento
                  </h2>
                  <p>I dati vengono trattati per:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Fornire e gestire il servizio di condivisione appunti
                    </li>
                    <li>Gestire l&apos;account utente</li>
                    <li>Migliorare e personalizzare il servizio</li>
                    <li>Garantire la sicurezza della piattaforma</li>
                    <li>Comunicare aggiornamenti e informazioni importanti</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    4. Base Giuridica del Trattamento
                  </h2>
                  <p>Il trattamento dei dati si basa su:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Esecuzione del contratto di servizio</li>
                    <li>Consenso dell&apos;utente</li>
                    <li>Legittimo interesse del titolare</li>
                    <li>Adempimento di obblighi legali</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    5. Conservazione dei Dati
                  </h2>
                  <p>
                    I dati personali vengono conservati per il tempo necessario
                    a fornire il servizio e rispettare gli obblighi di legge. In
                    particolare:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Dati dell&apos;account: fino alla chiusura
                      dell&apos;account
                    </li>
                    <li>
                      Contenuti caricati: fino alla loro rimozione da parte
                      dell&apos;utente
                    </li>
                    <li>
                      Dati di utilizzo: per il periodo necessario
                      all&apos;analisi e al miglioramento del servizio
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    6. Diritti dell&apos;Utente
                  </h2>
                  <p>L&apos;utente ha diritto di:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accedere ai propri dati personali</li>
                    <li>Richiedere la rettifica dei dati inesatti</li>
                    <li>Richiedere la cancellazione dei dati</li>
                    <li>Opporsi al trattamento dei dati</li>
                    <li>Richiedere la limitazione del trattamento</li>
                    <li>
                      Ricevere i dati in formato strutturato (portabilità)
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    7. Condivisione dei Dati
                  </h2>
                  <p>I dati personali potrebbero essere condivisi con:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Clerk.com per l&apos;autenticazione</li>
                    <li>Fornitori di servizi tecnici</li>
                    <li>Autorità competenti quando richiesto dalla legge</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    8. Cookie e Tecnologie Simili
                  </h2>
                  <p>Utilizziamo cookie e tecnologie simili per:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Mantenere attiva la sessione utente</li>
                    <li>Ricordare le preferenze dell&apos;utente</li>
                    <li>Analizzare l&apos;utilizzo del servizio</li>
                    <li>Migliorare le prestazioni del sito</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">
                    9. Modifiche alla Privacy Policy
                  </h2>
                  <p>
                    Ci riserviamo il diritto di modificare questa Privacy Policy
                    in qualsiasi momento. Le modifiche saranno effettive
                    immediatamente dopo la pubblicazione sul Servizio.
                    L&apos;utilizzo continuato del Servizio dopo tali modifiche
                    costituisce accettazione della nuova Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4">10. Contatti</h2>
                  <p>
                    Per qualsiasi domanda riguardante questa Privacy Policy o
                    per esercitare i tuoi diritti, contattare:
                    appunti.liceo.aprosio@gmail.com
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
