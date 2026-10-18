# 07 · Marca

## Identidad

- **Nombre:** SERENA · Masajes & Bienestar
- **Tagline:** *Un momento para vos.*
- **Logo:** trazo fino de manos sobre una silueta, con "SERENA" en serif espaciada.
- **Tono:** cálido, calmo, cercano (voseo), sin tecnicismos.

## Paleta (aproximada, a ajustar con los archivos originales del logo)

Valores tomados de los diseños de Micaela; están definidos en `apps/web/src/app/globals.css`.

| Rol | Color | Hex | Uso |
|---|---|---|---|
| Fondo | Crema rosado | `#f6ebe3` | Fondo general |
| Tarjeta cálida | Rosa empolvado | `#efdcd0` | Tarjetas, recuadros |
| Tarjeta verde | Lino | `#ddd6c6` | Tarjeta "Ya soy cliente", íconos alternados |
| Acción principal | Terracota | `#a8614a` | Botones "Continuar", "Reservar turno", selección |
| Acción secundaria | Verde oliva | `#666b4a` | Botones alternados, hojas, check final |
| Texto | Marrón café | `#3a2820` | Títulos y texto principal |
| Texto secundario | Topo | `#8c7365` | Descripciones, rótulos |

> Pendiente: confirmar los **hex exactos** con el archivo original del logo.

## Tipografía
- **Títulos:** *Cormorant Garamond* (serif elegante), con números de altura pareja.
- **Texto:** *Jost* liviana, con mayúsculas espaciadas para rótulos ("MASAJES & BIENESTAR").
- **Tagline:** *Sacramento* (manuscrita) para "Un momento para vos."

## Elementos visuales
- **Logo:** por ahora, una versión de texto con un trazo simplificado (`apps/web/src/components/brand-logo.tsx`). Se reemplaza por el **SVG original** cuando esté disponible.
- **Hojas de olivo** en las esquinas y **formas suaves** de fondo (`decorations.tsx`).
- **Íconos de línea** (librería `lucide-react`); el loto y el rodillo de maderoterapia están dibujados a mano. Cada servicio guarda su ícono en `Service.icon`.
- **Botones** redondeados con flecha, terracota u oliva alternados.

## Instagram
Hay una grilla de contenido planificada (bienvenida, el espacio, servicios, beneficios, sobre mí, reservas...). Cuando el sitio esté en línea, cambiar en la bio "Reservas por mensaje" por **"Reservá online"** con el link al sitio.

## Fotos del espacio

Las fotos reales generan más confianza que las de stock. Recomendaciones para la sesión de fotos:
- Una **sábana o toalla crema** sobre la camilla (el negro queda frío frente a la paleta).
- Sacar del cuadro cajas, alargues y papeles.
- **Luz cálida**, vela o difusor encendido.
- **Planos cerrados** de detalles: aceites, piedras, toallas enrolladas, manos.
- Formato horizontal para la web y vertical para Instagram.
