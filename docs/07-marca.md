# 07 · Marca

## Identidad

- **Nombre:** SERENA · Masajes & Bienestar
- **Tagline:** *Un momento para vos.*
- **Logo:** una mano en trazo fino sobre una silueta ondulada, "SERENA" en serif terracota y "MASAJES & BIENESTAR" en verde oliva entre dos líneas.
- **Tono:** cálido, calmo, cercano (voseo), sin tecnicismos.

## Paleta

La **terracota** es el color exacto del logo oficial; el resto sale de los diseños de Micaela. Están definidos en `apps/web/src/app/globals.css`.

| Rol | Color | Hex | Uso |
|---|---|---|---|
| Fondo | Crema rosado | `#f6ebe3` | Fondo general |
| Tarjeta cálida | Rosa empolvado | `#efdcd0` | Tarjetas, recuadros |
| Tarjeta verde | Lino | `#ddd6c6` | Tarjeta "Ya soy cliente", íconos alternados |
| Acción principal | Terracota (logo) | `#a14d29` | Logo, botones "Continuar", "Reservar turno", selección |
| Acción secundaria | Verde oliva | `#666b4a` | Botones alternados, hojas, check final |
| Texto | Marrón café | `#3a2820` | Títulos y texto principal |
| Texto secundario | Topo | `#8c7365` | Descripciones, rótulos |

> El verde del texto "MASAJES & BIENESTAR" del logo es `#535234`; para los botones se usa el oliva un poco más claro de los diseños.

## Tipografía
- **Títulos:** *Cormorant Garamond* (serif elegante), con números de altura pareja.
- **Texto:** *Jost* liviana, con mayúsculas espaciadas para rótulos ("MASAJES & BIENESTAR").
- **Tagline:** *Sacramento* (manuscrita) para "Un momento para vos."

## Elementos visuales
- **Logo oficial** (PNG con fondo transparente): `apps/web/public/logo-serena.png`, recortado del archivo original. Debajo se agrega la frase manuscrita "Un momento para vos." como en los diseños (el logo no la incluye). El ícono de la pestaña (`apps/web/src/app/icon.png`) es la "S" del logo.
- **Hojas de olivo** en las esquinas y **formas suaves** de fondo (`decorations.tsx`).
- **Íconos de línea** (librería `lucide-react`); el loto y el rodillo de maderoterapia están dibujados a mano. Cada servicio guarda su ícono en `Service.icon`.
- **Botones** redondeados con flecha, terracota u oliva alternados.

## Responsive
Los diseños de Micaela son para celular; la versión para computadora es una adaptación que mantiene el mismo estilo. En celular, una columna como en los diseños. Desde tablet (`md`, 768 px) el contenido se reparte en columnas: las dos tarjetas del inicio lado a lado, el texto y la foto de "primera vez" en paralelo, los masajes en dos columnas, y en la reserva el calendario junto al texto, los datos en dos columnas y el resumen junto a las opciones de pago.

## Instagram
Hay una grilla de contenido planificada (bienvenida, el espacio, servicios, beneficios, sobre mí, reservas...). Cuando el sitio esté en línea, cambiar en la bio "Reservas por mensaje" por **"Reservá online"** con el link al sitio.

## Fotos del espacio

Las fotos reales generan más confianza que las de stock. Recomendaciones para la sesión de fotos:
- Una **sábana o toalla crema** sobre la camilla (el negro queda frío frente a la paleta).
- Sacar del cuadro cajas, alargues y papeles.
- **Luz cálida**, vela o difusor encendido.
- **Planos cerrados** de detalles: aceites, piedras, toallas enrolladas, manos.
- Formato horizontal para la web y vertical para Instagram.
