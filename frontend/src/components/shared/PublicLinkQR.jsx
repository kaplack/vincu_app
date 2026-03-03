import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, QrCode, Download } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

/**
 * Reusable public link component
 *
 * Props:
 * - title: string
 * - description?: string
 * - url: string
 * - whatsappMessage?: string
 * - fileName?: string
 */
export default function PublicLinkQR({
  title,
  description,
  url,
  whatsappMessage,
  fileName = "qr-code",
}) {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handleWhatsApp = () => {
    if (!url) return;

    const message = whatsappMessage ? `${whatsappMessage}\n${url}` : url;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const generateQR = async () => {
    if (!url) return;

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
      });
      setQrDataUrl(dataUrl);
      setShowQR(true);
    } catch {
      toast.error("No se pudo generar el QR");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${fileName}.png`;
    link.click();
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-slate-600">{description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Input value={url || ""} readOnly />
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleWhatsApp} variant="outline">
            Compartir por WhatsApp
          </Button>

          <Button onClick={generateQR} variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Ver QR
          </Button>

          {qrDataUrl && (
            <Button onClick={handleDownload} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Descargar QR
            </Button>
          )}
        </div>

        {showQR && qrDataUrl && (
          <div className="flex justify-center pt-4">
            <img src={qrDataUrl} alt="QR Code" className="border rounded-md" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
