import { ShieldCheck, CheckCircle2 } from "lucide-react";
import Button from "./Button";

// Bloque reutilizable de autorizacion para el tratamiento de datos
// personales (Ley 1581 de 2012), usado al final de los formularios de
// registro de cada modulo. `purpose` ajusta el parrafo inicial para que
// el texto sea coherente con lo que ese formulario realmente recolecta o
// referencia (usuarios, cuentadantes, responsables, firmas, etc.).
export default function DataConsentCard({ purpose, given, onToggle, error }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <ShieldCheck size={18} className="text-(--primary-950)" />
        Autorización para el tratamiento de datos personales
      </h2>

      <div className="space-y-3 text-sm leading-relaxed text-neutral-700">
        <p>
          De conformidad con la <strong>Ley 1581 de 2012</strong>, el Decreto Reglamentario 1377 de 2013 y demás
          normas concordantes sobre protección de datos personales en Colombia, <strong>Atlantic IMS</strong> informa
          que los datos personales relacionados en este formulario {purpose} serán recolectados, almacenados, usados
          y tratados con la finalidad de administrar el registro correspondiente y garantizar el correcto
          funcionamiento administrativo del sistema.
        </p>
        <p>
          Como titular de la información, usted tiene derecho a conocer, actualizar y rectificar sus datos; a
          solicitar prueba de esta autorización; a ser informado sobre el uso que se les ha dado; a revocarla y/o
          solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías
          constitucionales y legales; a presentar quejas ante la Superintendencia de Industria y Comercio; y a
          acceder de forma gratuita a sus datos personales, en los términos del artículo 8 de la Ley 1581 de 2012.
        </p>
        <p>
          El suministro de estos datos es voluntario; sin embargo, la negativa a autorizar su tratamiento podrá
          impedir el registro dentro del sistema, dado que dicha información es necesaria para su correcto
          funcionamiento. Atlantic IMS se compromete a proteger la información aquí registrada, utilizándola
          únicamente para las finalidades descritas y adoptando medidas de seguridad razonables para evitar su
          alteración, pérdida, uso o acceso no autorizado.
        </p>
      </div>

      <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-(--primary-950)/20 bg-(--primary-950)/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-800">
          Al autorizar, usted declara que ha leído y comprendido la información anterior y otorga su consentimiento
          libre, previo, expreso e informado a Atlantic IMS para el tratamiento de los datos personales relacionados
          con este registro.
        </p>

        <Button
          type="button"
          variant={given ? "primary" : "secondary"}
          className="shrink-0 gap-2 whitespace-nowrap"
          onClick={onToggle}
        >
          {given ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
          {given ? "Autorización concedida" : "Autorizo el tratamiento de mis datos personales"}
        </Button>
      </div>

      {error && <p className="mt-2 text-caption text-red-800">{error}</p>}
    </div>
  );
}
