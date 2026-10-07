# Design

## Context

`StreetViewPanel` (`src/components/StreetViewPanel.tsx`) gestiona cuatro estados: `cargando`, `sin-clave`, `sin-cobertura` y `listo`. En `sin-clave` solo pinta un mensaje de aviso dentro del overlay (`.message`), sin ninguna salida para ver la calle. La clave se lee con `hasApiKey()`/`getApiKey()` de `src/lib/googleMapsLoader.ts` desde `VITE_GOOGLE_MAPS_API_KEY`, y el requisito nuevo añadido al delta `specs/street-view/spec.md` exige ofrecer un enlace externo solo cuando falta la clave. Ver `proposal.md` - Why.

## Goals / Non-Goals

**Goals:**

- Que, sin clave de API, el usuario pueda ver la calle del grafiti desde el propio panel con un clic, sin instalar nada ni configurar credenciales.
- Mantener intactos los cuatro estados actuales y los 5 requisitos previos de `street-view`.
- Coste cero: ninguna llamada a la API de Google ni consumo de cuota.

**Non-Goals:**

- Sustituir la panorámica embebida cuando sí hay clave (sigue siendo la vía principal).
- Añadir el enlace en el estado `sin-cobertura`: si Google no tiene panoramas allí, su enlace tampoco serviría y solo se añadiría ruido.
- Ofrecer otro proveedor de panorámicas (Mapillary, KartaView) o guardar la URL en el catálogo.
- Modificar `graffitis.json`, el mapa o el panel de detalle.

## Decisions

1. **Formato del enlace**: `https://www.google.com/maps?layer=cbs&cbll={lat},{lng}` con las coordenadas tal cual del registro (hasta 8 decimales, sin redondear), generado por una función pura `streetViewUrl(lat, lng)` en un módulo nuevo `src/lib/streetViewUrl.ts`.
   - *Alternativas*: `https://maps.google.com/maps?cbll=..&cbp=11,0,0,0,0` (formato antiguo equivalente) y `https://www.google.com/maps/@lat,lng,3a,75y,0t/data=!3m1!1e3` (formato de detalle con `data=`). Se elige `layer=cbs&cbll` por ser el deeplink de Street View más corto y estable; la tarea de humo lo abre en el navegador para confirmar que cae en Street View apuntando a Bogotá, y si no, se cambia por la variante `cbp`.
   - *Cámara*: no se calcula `heading`. El rumbo solo tiene sentido desde la posición del panoramas y aquí no la conocemos; Google coloca la cámara en el panorama más cercano, que es exactamente lo que hace el servicio embebido.
2. **Dónde se pinta**: dentro del bloque `sin-clave` de `StreetViewPanel`, bajo el aviso, en el mismo overlay (`.message` reestructurado en columna: texto + enlace). Así la alternativa aparece exactamente donde el usuario encontró el problema, sin tocar el header ni el panel de detalle.
3. **Atributos del enlace**: `<a href target="_blank" rel="noopener noreferrer">` con `aria-label` descriptivo y `data-testid` para el test. Es un clic de usuario real, así que los bloqueadores de ventanas emergentes no lo interceptan y no hace falta JS.
4. **Módulo aparte para la URL**: `src/lib/streetViewUrl.ts` en vez de engancharlo a `googleMapsLoader.ts`, porque ese módulo es justo lo contrario (carga la API de Google con clave) y así la función queda testeable sin `import.meta.env`.
5. **Pruebas**: unitario de `streetViewUrl` (URL exacta, decimales, coordenadas negativas de longitud) + `StreetViewPanel.test.tsx` (enlace presente en `sin-clave`, ausente con clave/sin cobertura, `href` con las coordenadas del grafiti y `target`/`rel` correctos).

## Risks / Trade-offs

- [Google reformatea o retira el deeplink `layer=cbs`] → Mitigación: verificación manual en la tarea de humo abriendo el enlace real; la URL vive en una sola función con test, el cambio es de una línea.
- [El enlace envía las coordenadas del usuario a Google (sitio externo)] → Mitigación: ya es el comportamiento cuando hay clave; `rel="noopener noreferrer"` evita tab-nabbing y la pestaña original queda intacta.
- [Street View no tiene cobertura en esa coordenada] → Mitigación: Google muestra su propio aviso; el estado `sin-cobertura` del embebido ya cubre el caso cuando hay clave.
- [Clic en enlace externo desde un overlay con `role="dialog"`] → Mitigación: no se cierra el diálogo ni se pierde el estado del mapa; el usuario vuelve a la pestaña original con el visor tal cual.

## Migration Plan

Cambio frontend sin despliegue ni datos: se implementa, se corre `npm test` + `npm run build`, y se humea en `npm run dev` sin `.env`. Rollback: revertir el commit (el aviso original sigue intacto).

## Open Questions

- Ninguno: la duda de si ofrecer el enlace también con clave o sin cobertura queda resuelta en Decisions 1/2 y reflejada en el escenario "Con clave configurada" del delta.
