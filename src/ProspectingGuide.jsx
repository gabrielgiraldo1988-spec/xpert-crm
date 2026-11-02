// Paula's prospecting guide for Rebel dispatch sales. Static content; edit the text here to update it.
const RED = "#e0262f";
const NAVY = "#0b2545";

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-xl border p-5 flex flex-col gap-3" style={{ borderColor: "#e2e4e0" }}>
      <h2 className="text-base font-bold" style={{ color: NAVY }}>{title}</h2>
      <div className="text-sm leading-relaxed flex flex-col gap-3" style={{ color: "#0f172a" }}>{children}</div>
    </section>
  );
}

function Quote({ children }) {
  return (
    <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fdeced", borderLeft: `3px solid ${RED}` }}>{children}</div>
  );
}

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>{head.map((h) => <th key={h} className="text-left font-semibold px-3 py-2 border-b" style={{ color: NAVY, borderColor: "#e2e4e0" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className="px-3 py-2 border-b align-top" style={{ borderColor: "#f1f1ef" }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProspectingGuide() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-10">
      <div>
        <h1 className="text-xl font-bold" style={{ color: NAVY }}>Guía de prospección</h1>
        <p className="text-sm mt-1" style={{ color: "#64748b" }}>
          Tu meta no es hacer muchas llamadas: es <strong style={{ color: RED }}>agendar llamadas de 15 minutos con Gabriel</strong> con dueños de camión que necesitan dispatch.
        </p>
      </div>

      <Section title="Rutina diaria">
        <ol className="list-decimal pl-5 flex flex-col gap-1.5">
          <li><strong>8:30–9:00 — Preparar.</strong> Revisa la cola de llamadas y los pendientes de "llámame más tarde". Esos van primero.</li>
          <li><strong>9:00–12:00 — Llamadas.</strong> Con cada contacto: revisa su MC en SAFER (30 segundos), llama, y si cae en buzón deja el mensaje corto y manda el WhatsApp en ese mismo minuto.</li>
          <li><strong>12:00–13:00 — Responder.</strong> Contesta los WhatsApp y agenda con Gabriel a los que respondan.</li>
          <li><strong>13:00–16:00 — Llamadas.</strong> Mismo proceso. En la tarde contestan más los que manejan en la mañana.</li>
          <li><strong>16:00–16:30 — Cerrar el día.</strong> Registra el resultado de cada llamada y la hora de cada "llámame después". Nada queda solo en tu memoria.</li>
        </ol>
        <p><strong>Meta diaria:</strong> 40 contactos marcados, cada buzón con su WhatsApp, y todo registrado aquí.</p>
      </Section>

      <Section title="A quién estás llamando">
        <p>Los leads nuevos de la cola son <strong>dueños que recibieron su MC en los últimos días</strong> (1 a 5 camiones, TX, FL, GA, CA y NC). Todavía no tienen dispatcher de confianza: son los que más nos necesitan.</p>
        <p><strong>Tú confirmas en la llamada:</strong> si habla español, si maneja él mismo y si ya tiene dispatcher. Si habla solo inglés, márcalo para que lo llame alguien en inglés; no lo descartes.</p>
      </Section>

      <Section title="Guion de llamada">
        <p>Di el nombre despacio: <strong>Rebel. Freight. Solutions.</strong></p>
        <ol className="list-decimal pl-5 flex flex-col gap-1.5">
          <li><strong>Saludo:</strong> "Hola, ¿hablo con [nombre]? Le habla Paula, de Rebel Freight Solutions. ¿Está manejando o tiene un minuto?"</li>
          <li><strong>Gancho:</strong> "Una pregunta rápida: cuando le consiguen una carga, ¿usted ve el rate con original que paga el bróker?"</li>
          <li><strong>Calificar:</strong> "¿Usted mismo busca las cargas o tiene dispatcher? ¿Qué equipo maneja y por qué zonas?"</li>
          <li><strong>Diferencia:</strong> "Le mandamos el rate con original de cada carga y usted decide qué toma. Nelly, una camionera con hotshot, perdía 20–30% en B rates con su dispatcher anterior; hoy solo maneja."</li>
          <li><strong>Cierre:</strong> "Le propongo 15 minutos con Gabriel para revisar sus números. ¿Mañana en la mañana o en la tarde?"</li>
          <li><strong>Si dice que no:</strong> "¿Conoce a alguien que esté empezando con su MC? Pagamos un bono si firma."</li>
        </ol>
        <p><strong>Si preguntan el precio:</strong> "Depende del equipo y de las cargas; Gabriel se lo explica con números en la llamada de 15 minutos."</p>
      </Section>

      <Section title="Buzón de voz y WhatsApp">
        <p><strong>Buzón (15 segundos, despacio):</strong></p>
        <Quote>"Hola [nombre], le habla Paula, de Rebel... Freight Solutions. Le acabo de mandar un WhatsApp con una pregunta sobre los rates de sus cargas. Mi número: nueve, cinco, seis... nueve, cinco, cinco... sesenta y cuatro, cincuenta y cuatro. Gracias."</Quote>
        <p><strong>WhatsApp después del buzón</strong> (guárdalo como respuesta rápida <code>/seguimiento</code>):</p>
        <Quote>Hola [nombre], le habla Paula de Rebel Freight Solutions. Una pregunta rápida: ¿usted ve el rate con original de cada carga que le consiguen? Nosotros hacemos dispatch en español e inglés y le mandamos el rate con original de cada carga; usted decide qué toma. ¿Le gustaría 15 minutos con Gabriel para revisar sus números?</Quote>
        <p><strong>Confirmación de cita</strong> (<code>/cita</code>):</p>
        <Quote>Hola [nombre], quedó agendada su llamada con Gabriel de Rebel Freight Solutions: [día] a las [hora] (hora del Este). Lo llamamos a este número. Cualquier cambio, me escribe aquí.</Quote>
        <p><strong>Segundo intento:</strong> si no responde en 2 días, una llamada más y un WhatsApp corto ("Hola [nombre], ¿pudo ver el mensaje sobre los rates?"). Después, se archiva.</p>
      </Section>

      <Section title="Respuestas a objeciones">
        <Table
          head={["Lo que dicen", "Qué responder"]}
          rows={[
            ["\"Ya tengo dispatcher.\"", "\"Qué bueno. Una pregunta nada más: ¿le manda el rate con original de cada carga? Si algún día quiere comparar, le dejo mi WhatsApp.\""],
            ["\"Mi esposa / un familiar me despacha.\"", "\"Perfecto, nadie cuida mejor el negocio que la familia. Si ella necesita apoyo de noche o los fines de semana, cubrimos 24/7.\""],
            ["\"Yo mismo me despacho.\"", "\"¿Cuántas horas al día se le van buscando cargas y negociando? Esas horas las podría estar manejando.\""],
            ["\"¿Cuánto cobran?\"", "\"Depende del equipo y de las cargas. Gabriel se lo muestra con números en 15 minutos. ¿Mañana en la mañana o en la tarde?\""],
            ["\"Estoy manejando.\"", "\"Le llamo después. ¿A qué hora le queda mejor?\" → agéndalo aquí."],
            ["\"No me interesa.\"", "\"Entendido. ¿Conoce a alguien que esté empezando con su MC? Pagamos un bono si firma.\""],
            ["Contesta en inglés", "Sigue en inglés con el mismo guion o márcalo para que lo llame alguien en inglés."],
            ["Car hauler o equipo que no manejamos", "Agradece, pide referido y sácalo de la lista."],
          ]}
        />
      </Section>

      <Section title="Reglas que no se rompen">
        <ol className="list-decimal pl-5 flex flex-col gap-1.5">
          <li><strong>Solo decimos lo que es verdad.</strong> No menciones años de experiencia ni porcentajes hasta que Gabriel los confirme.</li>
          <li><strong>Cada WhatsApp es uno a uno.</strong> Nada de envíos masivos ni listas de difusión a personas que no nos conocen: WhatsApp bloquea el número y en EE. UU. los mensajes automáticos sin permiso pueden traer problemas legales.</li>
          <li><strong>Si alguien dice "no me llame más", no se le vuelve a llamar.</strong> Márcalo de inmediato.</li>
          <li><strong>Todo queda registrado aquí:</strong> cada llamada con su resultado y cada "llámame después" con su hora.</li>
          <li><strong>Máximo 2 intentos por contacto.</strong> Después se archiva.</li>
        </ol>
        <p>Si no sabes qué responder: "Eso se lo explica Gabriel en la llamada de 15 minutos".</p>
      </Section>
    </div>
  );
}
