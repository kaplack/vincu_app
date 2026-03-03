import PublicLinkQR from "@/components/shared/PublicLinkQR";
import { getCatalogUrl } from "@/utils/publicLinks";

/**
 * CatalogoQR
 * Displays the public rewards catalog link for a business.
 *
 * Props:
 * - business: business object (must contain slug)
 */
export default function CatalogoQR({ business }) {
  if (!business?.slug) return null;

  const url = getCatalogUrl(business);

  return (
    <PublicLinkQR
      title="Link del Catálogo Público"
      description="Comparte este enlace para que tus clientes vean las recompensas disponibles."
      url={url}
      whatsappMessage="Mira nuestro catálogo de recompensas y empieza a acumular puntos 🎁"
      fileName={`vincu-qr-catalog-${business.slug}`}
    />
  );
}
