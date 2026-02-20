import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageCircle,
  Mail,
  FileText,
  Video,
  Users,
  Coins,
  Gift,
  QrCode,
} from "lucide-react";

export default function Ayuda() {
  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold">Ayuda y Soporte</h1>
        <p className="text-slate-600">Guías rápidas y contacto con soporte</p>
      </div>

      {/* Contact Support */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Chat en Vivo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              Habla con nuestro equipo de soporte
            </p>
            <Button className="w-full">Iniciar Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Email</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              Envíanos un correo electrónico
            </p>
            <Button variant="outline" className="w-full">
              soporte@vincu.app
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Documentación</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              Lee nuestra guía completa
            </p>
            <Button variant="outline" className="w-full">
              Ver Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Guides */}
      <Card>
        <CardHeader>
          <CardTitle>Guías Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Users className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Cómo afiliar clientes</span>
              <span className="text-xs text-slate-600">
                Aprende a registrar nuevos clientes
              </span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Coins className="h-6 w-6 text-green-600" />
              <span className="font-semibold">Cómo sumar puntos</span>
              <span className="text-xs text-slate-600">
                Registra puntos por compras
              </span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <Gift className="h-6 w-6 text-purple-600" />
              <span className="font-semibold">Cómo validar canjes</span>
              <span className="text-xs text-slate-600">
                Valida recompensas canjeadas
              </span>
            </Button>

            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <QrCode className="h-6 w-6 text-orange-600" />
              <span className="font-semibold">Usar códigos QR</span>
              <span className="text-xs text-slate-600">
                Escanea QR de clientes
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                ¿Cómo funciona el programa de lealtad?
              </AccordionTrigger>
              <AccordionContent>
                Los clientes se registran y reciben una tarjeta digital en
                Google Wallet. Por cada compra, acumulan puntos que pueden
                canjear por recompensas que tú definas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                ¿Qué pasa si llego al límite de tarjetas?
              </AccordionTrigger>
              <AccordionContent>
                Si alcanzas el límite de tarjetas de tu plan, no podrás emitir
                nuevas membresías hasta que mejores tu plan. Las tarjetas
                existentes seguirán funcionando normalmente.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                ¿Cómo puedo personalizar mis tarjetas?
              </AccordionTrigger>
              <AccordionContent>
                Desde la sección "Tarjeta" puedes configurar el branding. El
                nivel de personalización depende de tu plan: Free tiene opciones
                básicas, mientras que Pro ofrece personalización completa sin
                marca VINCU.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                ¿Puedo tener múltiples operadores?
              </AccordionTrigger>
              <AccordionContent>
                Sí, desde Configuración puedes invitar operadores que podrán
                registrar puntos y validar canjes, pero no tendrán acceso a
                configuración ni reportes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>¿Cómo exporto mis datos?</AccordionTrigger>
              <AccordionContent>
                Si tu plan incluye Reportes, puedes exportar clientes,
                movimientos y canjes en formato Excel, CSV o PDF desde la
                sección de Reportes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                ¿Qué es una LoyaltyClass exclusiva?
              </AccordionTrigger>
              <AccordionContent>
                En el plan Pro, tu negocio tiene su propia clase de tarjeta en
                Google Wallet, lo que permite una personalización completa sin
                marca VINCU y mejor integración con el ecosistema de Google.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Video Tutorials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Tutoriales en Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="aspect-video rounded bg-slate-100"></div>
              <p className="font-semibold">Introducción a VINCU</p>
              <p className="text-sm text-slate-600">5:30 min</p>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="aspect-video rounded bg-slate-100"></div>
              <p className="font-semibold">Configurar tu primera recompensa</p>
              <p className="text-sm text-slate-600">3:45 min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
