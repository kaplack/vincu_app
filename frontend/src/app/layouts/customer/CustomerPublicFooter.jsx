import { Link } from "react-router-dom";

/**
 * Customer public footer
 * Minimal footer for public customer-facing pages such as:
 * - /join/:slug
 * - /c/:token
 * - /catalog/:businessSlug
 */
export default function CustomerPublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">
            Programa de fidelización digital
          </p>
          <p className="text-xs text-slate-500">Powered by Vincu</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <Link to="/" className="transition-colors hover:text-slate-800">
            Vincu
          </Link>

          <a
            href="mailto:hola@vincu.pe"
            className="transition-colors hover:text-slate-800"
          >
            Soporte
          </a>
        </div>
      </div>
    </footer>
  );
}
