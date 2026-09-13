---
name: emil-taste
description: Craft y "taste" de nivel Emil Kowalski (creador de Sonner y Vaul, autor de "Animations on the Web") para pulir UI web. Úsalo al construir o refinar cualquier interfaz — componentes, páginas, modales, transiciones, microinteracciones, estados hover/focus/loading/empty — cuando el objetivo sea que se vea y se sienta impecable, no genérico. Aplica a React 19 + TailwindCSS v4 de este proyecto.
---

# Emil Taste — Craft & Motion para UI impecable

Codifica los principios de *taste* y *motion* de Emil Kowalski. La meta no es "agregar animaciones", sino que cada interfaz se sienta **pulida, rápida y con intención**. El buen diseño se nota en los detalles que nadie describe pero todos sienten.

> **Regla madre:** *restraint*. Quita hasta que se rompa, luego devuelve lo mínimo. Menos bordes, menos sombras, menos color, menos movimiento — pero cada uno perfecto.

---

## 1. Motion — reglas no negociables

El movimiento comunica: da feedback, orienta y crea continuidad. Nunca es decoración.

**Duración (rápido siempre):**
| Interacción | Duración |
|---|---|
| Microinteracción (hover, press, toggle) | 100–150 ms |
| Entrada/salida de elementos (modal, dropdown, toast) | 200–300 ms |
| Transición de página / layout grande | 300–400 ms |

Si dudas, es **más rápido** de lo que crees. Una UI lenta se siente pesada.

**Easing (lo que separa amateur de pro):**
- **Entrada** (algo que aparece) → `ease-out`. Empieza rápido, desacelera. Curva favorita: `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Salida** (algo que se va) → `ease-in` o `ease-in-out`, y **más corta** que la entrada.
- **NUNCA `linear`** para UI (se siente robótico), salvo spinners o loops continuos.
- Movimiento natural → resortes (spring) físicos si hay lib; si no, un `ease-out` marcado se acerca.

**Qué animar (rendimiento = taste):**
- ✅ Solo `transform` y `opacity` → van por GPU, no causan reflow.
- ❌ Nunca animar `width`, `height`, `top`, `left`, `margin` → causan jank. Usa `transform: scale/translate`.
- Origen coherente: un menú que sale de un botón debe **escalar desde ese botón** (`transform-origin`).

**Accesibilidad obligatoria:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Nunca envíes motion sin respetar `prefers-reduced-motion`.

**Interrumpible:** una animación no debe bloquear la interacción. El usuario manda.

---

## 2. Tokens de motion para este stack (Tailwind v4)

No hay librería de animación (solo Tailwind v4 + clsx). Usa CSS/Tailwind. Define estos tokens en el `@theme` o `:root` y reúsalos:

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* entradas */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 130ms;
  --dur-base: 220ms;
}
```

Ejemplos correctos:
```tsx
// Botón: feedback inmediato al presionar
className="transition-transform duration-100 ease-out active:scale-[0.97]"

// Aparición de modal/dropdown (entrada ease-out, desde su origen)
className="origin-top transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
           data-[state=open]:opacity-100 data-[state=open]:scale-100
           data-[state=closed]:opacity-0 data-[state=closed]:scale-95"
```

Keyframes reutilizables (para toasts, drawers, etc.) van en el CSS global, no inline.

**Cuándo SÍ añadir una librería:** si necesitas gestos (drag-to-dismiss, drawers con momentum), stacking de toasts o springs interrumpibles, propón añadir la lib mínima — `motion` (Framer), `sonner` (toasts, del propio Emil) o `vaul` (drawers, del propio Emil) — explicando el trade-off de peso. No la asumas instalada.

---

## 3. Taste checklist — los detalles que importan

**Espaciado & ritmo**
- Escala consistente múltiplo de 4 (4/8/12/16/24/32…). Nada de `13px` sueltos.
- El espaciado *dentro* de un grupo < espaciado *entre* grupos (proximidad = jerarquía).
- Alineación óptica > matemática (íconos y texto a veces necesitan 1px de ajuste).

**Tipografía**
- Escala de tamaños limitada (5–6 pasos). No inventes tamaños por componente.
- `line-height` ~1.5 en cuerpo; más ajustado (1.1–1.25) en títulos grandes.
- `letter-spacing` negativo leve en títulos grandes; positivo en MAYÚSCULAS pequeñas.
- Números que cambian (precios, contadores, timers) → `font-variant-numeric: tabular-nums` para que no salten.

**Color & jerarquía**
- Paleta neutra dominante + **un** acento con moderación. En este proyecto usa las CSS vars del tema (`--color-primary`, etc.), nunca colores hardcodeados.
- Jerarquía con peso/tamaño/opacidad — no todo en negrita ni todo con color.
- Texto secundario = menor opacidad/tono, no otro color aleatorio.

**Bordes, sombras, radios**
- Bordes sutiles: 1px a baja opacidad. Un borde que grita es peor que ninguno.
- Sombras suaves y **en capas** (varias sombras tenues) > una sombra dura. La luz viene de arriba.
- Radios consistentes; en elementos anidados, el radio externo > interno (regla del radio concéntrico).

**Estados (lo que olvida el 90%)**
- Todo lo interactivo tiene `hover`, `active`, `focus-visible` y `disabled`.
- `focus-visible` con anillo claro (a11y) — nunca `outline: none` sin reemplazo.
- `disabled`: opacidad + `cursor-not-allowed`, y realmente no-interactivo.
- `cursor-pointer` en todo lo clickeable.

**Estados de datos**
- Loading → *skeletons* que imitan el layout final (evita CLS), no spinners genéricos. (Este proyecto ya tiene `Skeleton*` y spinners con `border-theme-primary`.)
- Empty → diseñado: icono + mensaje contextual + CTA. Nunca un espacio en blanco.
- Optimistic UI donde tenga sentido (la acción se ve instantánea, se reconcilia después).
- Error → inline y accionable, no un `alert()`.

**Sin layout shift**
- Reserva espacio para contenido async (dimensiones/aspect-ratio).
- Imágenes con `width/height` o contenedor con aspect-ratio.

---

## 4. Microinteracciones (patrones Emil)

- **Botón:** al presionar, `scale-[0.97]` en 100ms ease-out → feedback físico.
- **Toggle/switch:** el thumb se desliza con `transform`, no aparece/desaparece.
- **Toast (estilo Sonner):** apilados, swipe para descartar, auto-dismiss, entra desde el borde con ease-out.
- **Drawer/sheet (estilo Vaul):** handle para arrastrar, momentum, el fondo escala ligeramente (`scale-95`) + oscurece.
- **Listas:** al insertar/eliminar ítems, anima con transform+opacity; considera stagger sutil (≤30ms entre ítems) solo si aporta.

---

## 5. Cómo trabajar con este skill

1. **Antes de codear**, decide la intención: ¿qué feedback/orientación necesita esta interacción? Si ninguna, no animes.
2. **Construye con restraint**: primero sin adornos; añade sombra/borde/motion solo si mejora la claridad.
3. **Usa los tokens** del proyecto (CSS vars de tema, escala de espaciado, `clsx` para variantes).
4. **Pasa el checklist de taste** (sección 3) sobre lo que hiciste.
5. **Revisa el motion**: duración corta, `ease-out` en entradas, solo transform/opacity, `prefers-reduced-motion` respetado.
6. Coordina con el skill `senior-frontend` para arquitectura/convenciones; este skill aporta el *acabado* visual y de interacción.

---

## Anti-patrones (evítalos siempre)

- ❌ Animaciones lentas (>400ms en UI común) o con `linear`.
- ❌ Animar `width/height/top/left` (jank).
- ❌ Sombras duras, bordes de alto contraste, gradientes gratuitos, demasiados colores.
- ❌ Movimiento sin propósito ("porque queda cool").
- ❌ Faltar estados `focus-visible`/`disabled`, o `outline:none` sin reemplazo.
- ❌ Spinners donde un skeleton comunica mejor.
- ❌ Colores hardcodeados en vez de las CSS vars del tema.
- ❌ Ignorar `prefers-reduced-motion`.
