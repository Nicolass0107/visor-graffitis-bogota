# Proposal

## Why

Al pulsar "Ver el lugar" sin `VITE_GOOGLE_MAPS_API_KEY` configurada, el panel solo informa que falta la clave y no hay ninguna alternativa para ver la calle; conseguir la clave exige una cuenta Google con facturación habilitada, algo que quizá el usuario no quiera activar para una demo. Google Maps permite abrir Street View directamente con unas coordenadas mediante un enlace normal, sin API key y sin coste.

## What Changes

- En el estado `sin-clave` del panel "Vista del lugar", además del aviso existente, se muestra un enlace **"Abrir en Street View de Google Maps"** que abre la panorámica en una pestaña/ventana nueva con las coordenadas exactas del grafiti.
- El enlace se construye a partir de `lat`/`lng` del registro seleccionado y se abre fuera de la aplicación (`target="_blank"` + `rel="noopener noreferrer"`); no consume cuota ni requiere clave, porque no se llama a la API de Google.
- No cambia el comportamiento actual cuando sí hay clave (panorámica embebida), ni el aviso de "clave faltante", ni el mensaje de "sin cobertura" con la foto alternativa.

## Capabilities

### New Capabilities

- (ninguna)

### Modified Capabilities

- `street-view`: se añade un requisito nuevo —"Vista de calle sin clave mediante enlace externo"— que obliga a ofrecer la alternativa de abrir Street View de Google Maps en una pestaña nueva cuando falte la clave de API. Los 5 requisitos existentes de la capacidad se mantienen sin cambios.

## Impact

- Código: `src/components/StreetViewPanel.tsx` (bloque del estado `sin-clave`) y su CSS module; posible helper de URL en `src/lib/` (junto a `googleMapsLoader.ts`, que ya tiene `hasApiKey()`).
- Tests: `src/components/StreetViewPanel.test.tsx` (enlace visible en `sin-clave`, atributos y coordenadas en la URL) y, si procede, `src/App.test.tsx`.
- Documentación: `README.md` (sección de Street View y checklist de humo).
- Sin dependencias nuevas, sin backend, sin tocar `src/data/graffitis.json` ni el mapa.
