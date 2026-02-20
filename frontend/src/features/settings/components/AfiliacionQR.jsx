import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Copy, Share2, QrCode, Download } from "lucide-react";
import { toast } from "sonner";

import QRCode from "qrcode";

export default function AfiliacionQR({ business }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [generating, setGenerating] = useState(false);

  const baseUrl =
    import.meta.env.VITE_PUBLIC_BASE_URL || "http://localhost:5173";

  const affiliationLink = useMemo(() => {
    const slug = business?.slug?.trim();
    // Si no hay slug, mostramos un mensaje (no usamos id porque el join es /join/:slug)
    if (!slug) return "";
    return `${baseUrl}/join/${slug}`;
  }, [baseUrl, business?.slug]);

  // Genera el QR solo cuando se va a mostrar (y solo si no existe aún)
  useEffect(() => {
    if (!showQR) return;
    if (!affiliationLink) return;
    if (qrDataUrl) return;

    (async () => {
      try {
        setGenerating(true);
        const dataUrl = await QRCode.toDataURL(affiliationLink, {
          width: 320,
          margin: 1,
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error(err);
        toast.error("No se pudo generar el QR");
      } finally {
        setGenerating(false);
      }
    })();
  }, [showQR, affiliationLink, qrDataUrl]);

  const handleCopyLink = async () => {
    if (!affiliationLink) return;
    await navigator.clipboard.writeText(affiliationLink);
    toast.success("Link copiado al portapapeles");
  };

  const handleShareWhatsApp = () => {
    if (!affiliationLink) return;
    const message = `¡Únete a nuestro programa de lealtad! ${affiliationLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const slug = business?.slug?.trim() || "afiliacion";
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `vincu-qr-join-${slug}.png`;
    a.click();
  };

  const canUse = Boolean(affiliationLink);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link de Afiliación</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canUse && (
          <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
            Este negocio aún no tiene <b>slug</b>. Ejecuta el backfill o crea el
            negocio nuevamente para generar el link <b>/join/:slug</b>.
          </div>
        )}

        <div className="space-y-2">
          <Label>URL de Afiliación</Label>
          <div className="flex gap-2">
            <Input
              value={affiliationLink || "—"}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2"
              disabled={!canUse}
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleShareWhatsApp}
            className="gap-2"
            disabled={!canUse}
          >
            <Share2 className="h-4 w-4" />
            Compartir por WhatsApp
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            disabled={!canUse}
            onClick={() => setShowQR((v) => !v)}
          >
            <QrCode className="h-4 w-4" />
            {showQR ? "Ocultar QR" : "Ver QR"}
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            disabled={!qrDataUrl}
            onClick={handleDownloadQR}
          >
            <Download className="h-4 w-4" />
            Descargar QR
          </Button>
        </div>

        {showQR && (
          <div className="flex items-start gap-4 rounded-xl border p-4">
            <div className="h-40 w-40 overflow-hidden rounded-lg border bg-white">
              {generating ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  Generando...
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR de afiliación"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  —
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">QR de afiliación</p>
              <p className="text-xs text-slate-600">
                Este QR siempre apunta al mismo link (mientras el slug no
                cambie).
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
