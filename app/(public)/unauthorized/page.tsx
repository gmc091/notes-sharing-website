// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Accesso Limitato
        </h2>
        <p className="text-gray-600 mb-4">
          Per visualizzare questo sito devi appartenere all&apos;organizzazione
          del Liceo Aprosio. Accedi con il tuo indirizzo email @liceoaprosio.it
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Torna alla Home
        </a>
      </div>
    </div>
  );
}
