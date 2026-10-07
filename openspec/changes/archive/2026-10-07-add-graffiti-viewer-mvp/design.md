# Design

## Context

El repositorio está vacío: no hay código, specs previas ni infraestructura. Ver `proposal.md` (Why) para la motivación. Restricciones acordadas para este MVP:

- Stack: React + Vite + MapLibre GL (mapa sin dependencia de tokens propietarios).
- Imágenes street-level: Google Street View para el entorno de la calle; fotos de grafiti propias.
- Sin backend: los datos viven en un archivo JSON versionado y las fotos en `public/`.
- UI y artefactos en español; el CLI de OpenSpec ya quedó inicializado en el repo.

## Goals / Non-Goals

**Goals:**

- Una app estática que arranque en el mapa de Bogotá, pinte grafitis como marcadores y abra Street View al hacer clic.
- Filtros y búsqueda 100% en el cliente, sin latencia de red.
- Degradación elegante: sin clave de API o sin cobertura de Street View, el resto de la app sigue funcionando.

**Non-Goals:**

- Carga/edición de grafitis por usuarios (queda para un cambio futuro).
- Backend, base de datos, autenticación o API pública.
- App móvil nativa o PWA offline.
- Soporte multilingüe.

## Decisions

### 1. Mapa base: MapLibre GL con tiles raster de OSM

- **Elegido**: `maplibre-gl` con source de tiles raster públicos de OpenStreetMap (estilo mínimo propio en JSON).
- **Alternativas**: Google Maps JS API (acoplamiento total a Google y coste por render); Leaflet (sin WebGL, sin clustering nativo, rendimiento inferior con miles de marcadores).
- **Razón**: el mapa es independiente de Street View, así que solo Google entra por la panorámica; MapLibre evita ese coste y permite control total del estilo.

### 2. Street View: Maps JavaScript API + `StreetViewPanorama`

- **Elegido**: cargar dinámicamente la librería de Google Maps con `VITE_GOOGLE_MAPS_API_KEY` y montar un `StreetViewPanorama` apuntando a las coordenadas del grafiti con `StreetViewService` para verificar cobertura antes.
- **Alternativas**: iframe del Embed de Street View (sin control de orientación ni callback de cobertura, no cumple el requisito de orientar la cámara al grafiti); Mapillary (cobertura irregular en Bogotá).
- **Razón**: es la única forma de cumplir "orientación hacia el grafiti" y "mensaje cuando no hay cobertura" de manera programática.
- **Nota**: la clave se expone al cliente (normal en frontend de Google Maps); se restringe por HTTP referrer en la consola de Google.

### 3. Clusterización de marcadores nativa de MapLibre

- **Elegido**: source GeoJSON con `cluster: true` y capas propias de clusters/etiquetas; sin librerías extra.
- **Alternativas**: `@mapbox/mapbox-gl-marker-cluster` (mantenimiento dudoso), render condicional por zoom (no resuelve densidad real).
- **Razón**: viene de fábrica, cero dependencias y cumple "vista alejada agrupada / vista acercada individual".

### 4. Datos: JSON importado como módulo

- **Elegido**: `src/data/graffitis.json` importado en tiempo de build, validado en un adaptador (`loadCatalog`) que filtra coordenadas fuera de Bogotá y expone un tipo `Graffiti`.
- **Alternativas**: fetch a `/data/graffitis.json` (validación igual pero un paso de red extra y peor manejo de errores en build).
- **Razón**: sin backend, el import da errores tempranos y simplifica el manejo de "catálogo no disponible".

### 5. Estado: React local en `App` con props hacia los hijos

- **Elegido**: `useState`/`useMemo` en el componente `App` (catálogo, filtros, grafiti seleccionado, vista de calle abierta), pasados por props a los cuatro hijos (`MapCanvas`, `FilterBar`, `DetailPanel`, `StreetViewPanel`). Sin librería de estado global ni Context.
- **Alternativas**: Redux/Zustand (complejidad innecesaria para un MVP con un árbol de componentes corto); Context (no aporta: todos los consumidores son hijos directos de `App` y un Context solo movería el acoplamiento de un lado a otro).
- **Razón**: los filtros ya se derivan con `useMemo`; el estado mínimo con props explícitas reduce el surface de tests (cada componente se prueba con props simples y sin envoltorio de provider).

### 6. Estilos: CSS Modules, sin librería de componentes

- **Elegido**: CSS Modules por componente + variables CSS para colores/espaciado.
- **Alternativas**: Tailwind (requiere setup de build adicional), MUI/Bootstrap (peso y look genérico).
- **Razón**: la UI es mapa + un panel lateral; poco volumen de estilos.

### 7. Sin router en el MVP

- **Elegido**: el panel de detalle vive en estado de React; no hay rutas.
- **Alternativas**: React Router con `/graffiti/:id` (útil para compartir enlaces, pero agrega complejidad ahora).
- **Razón**: el requisito de compartir se cubre con "copiar coordenadas". Se evaluará en un cambio futuro.

### 8. TypeScript

- **Elegido**: TypeScript en todo el código de la app (Vite lo soporta sin config adicional).
- **Alternativas**: JavaScript puro (menos fricción inicial, pero sin garantías sobre el esquema de `graffitis.json` ni sobre los estados de la panorámica).
- **Razón**: el catálogo y los estados de Street View son datos con forma definida; el tipado evita errores enteros de coordenadas y campos faltantes.

## Risks / Trade-offs

- [Cobertura de Street View irregular en Bogotá] → Requisito de fallback con foto y mensaje explícito; se puede ampliar con Mapillary después sin tocar specs (nueva alternativa detrás de la misma capacidad).
- [Coste/cuota de la API de Google Maps] → Clave restringida por referrer y HTTP referrer; el mapa no depende de Google, solo la panorámica. Si se excede la cuota, la app degrada al estado "clave no configurada/no disponible".
- [Tiles de OSM con política de uso] → Adecuado para desarrollo y tráfico bajo; para producción considerar un proveedor de tiles (Protomaps, MapTiler) cambiando solo la URL del source.
- [Fotos de grafitis alojadas en `public/` aumentan el peso del repo] → Mantener imágenes optimizadas (WebP, ≤300 KB) y pocos grafitis semilla en el MVP.
- [Sin backend, datos estáticos] → Aceptado para el MVP; el catálogo se vuelve editable en el cambio de carga de grafitis.

## Migration Plan

1. Desarrollo local con `npm run dev` y `.env` (gitignored) con la clave de Google.
2. Despliegue como sitio estático (Vercel/Netlify/GitHub Pages): `npm run build` → `dist/`.
3. Rollback: revert del commit; no hay datos ni esquemas que migrar.

## Open Questions

- ~~Procedencia de las fotos y coordenadas de los grafitis semilla~~ — **Resuelto**: se sembró con 10 grafitis de ejemplo (coordenadas plausibles de barrios reales de Bogotá) y fotos SVG generadas por `scripts/generate-placeholder-photos.mjs` en `public/graffitis/`. El README documenta cómo reemplazarlos por fotos reales sin tocar código.
