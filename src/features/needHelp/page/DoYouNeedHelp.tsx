import {
  BookOpen,
  MessageCircle,
  Phone,
  FileText,
  Shield,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Mail,
} from "lucide-react";

export default function DoYouNeedHelp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-5 shadow-md">
            <MessageCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 mb-3">
            Centro de Ayuda
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full mb-4" />
          <p className="text-slate-600 text-lg leading-relaxed max-w-xl mx-auto">
            Hola, soy <span className="font-semibold text-amber-600">Luis González</span> y estoy aquí para ayudarte.
            Antes de contactar soporte, te recomendamos revisar la documentación
            disponible. Esto te permitirá resolver la mayoría de dudas de forma
            rápida y eficiente.
          </p>
        </div>

        {/* Manuales */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Manuales Disponibles
            </h2>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Manual de Usuario – Agentes",
                desc: "Instrucciones para el flujo de trabajo diario de agentes.",
                icon: FileText,
              },
              {
                title: "Manual de Usuario – Administración",
                desc: "Guía completa para administradores del sistema.",
                icon: Shield,
              },
            ].map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                    {title}
                  </p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Recomendaciones
            </h2>
          </div>

          <ul className="space-y-4">
            {[
              "Si tienes dudas sobre cómo realizar un proceso o utilizar una funcionalidad, consulta primero el manual correspondiente.",
              "Si experimentas un error del sistema o un inconveniente técnico, puedes comunicarte directamente para recibir asistencia.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-600 leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Contacto de Soporte
            </h2>
          </div>
          <div className="mb-6 ml-[52px]">
            <p className="font-bold text-slate-800 text-lg">Luis González</p>
            <p className="text-slate-500 text-sm mb-2">
              Hola, soy Luis González. Estoy para ayudarte con esta aplicación de PlantAccess.
            </p>
            <p className="text-slate-500">
              Si necesitas ayuda adicional, puedes comunicarte a través de los siguientes medios:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Llamada */}
            <a
              href="tel:+50230073811"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  Llamada Telefónica
                </p>
                <p className="text-xs text-amber-600 font-medium">Corporativo</p>
                <p className="text-sm text-slate-500">+502 3007-3811</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/50230073811"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                <MessageCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  WhatsApp
                </p>
                <p className="text-xs text-amber-600 font-medium">Corporativo</p>
                <p className="text-sm text-slate-500">Respuesta más ágil</p>
              </div>
            </a>

            {/* Correo */}
            <a
              href="mailto:soportetecnico.tejar02@legumex.net"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  Correo Electrónico
                </p>
                <p className="text-xs text-amber-600 font-medium">Corporativo</p>
                <p className="text-sm text-slate-500 truncate max-w-[140px]">soportetecnico.tejar02@legumex.net</p>
              </div>
            </a>
          </div>

          <div className="mt-5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              En caso de no poder atender tu llamada, se recomienda enviar un
              mensaje por <span className="font-semibold">WhatsApp</span>, ya
              que Luis podría encontrarse en reunión o en una actividad que
              impida responder de inmediato.
            </p>
          </div>
        </div>

        {/* Nota final */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-90" />
          <p className="font-semibold text-lg mb-1">Nota Final</p>
          <p className="text-white/90 leading-relaxed text-sm">
            Tu tiempo es valioso. Revisar los manuales antes de solicitar
            soporte permitirá una atención más ágil y efectiva.
          </p>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-40 animate-ping" />
        <div
          className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full opacity-40 animate-ping"
          style={{ animationDelay: "700ms" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-amber-500 rounded-full opacity-40 animate-ping"
          style={{ animationDelay: "1400ms" }}
        />
      </div>
    </div>
  );
}
