# Proposal

## Why

Bogotá tiene una escena de grafiti extensa y distribuida por toda la ciudad, pero no existe una forma sencilla de explorarla geográficamente: quien quiere ver un grafiti no sabe dónde está ni cómo se ve el lugar que lo rodea. Este cambio crea el MVP de un visor web que muestra los grafitis sobre un mapa de Bogotá y, al hacer clic en uno, revela el entorno de la calle con vista panorámica tipo Google Street View.

## What Changes

- Se crea una aplicación web nueva (React + Vite + MapLibre GL) con mapa interactivo de Bogotá como pantalla principal.
- Se cargan los grafitis desde un catálogo de datos con coordenadas GPS, foto, barrio, autor y fecha, y se dibujan como marcadores en el mapa.
- Al hacer clic en un marcador se abre un panel de detalle con la foto en grande, los metadatos del grafiti y su dirección.
- El panel de detalle incluye una vista panorámica del lugar (Google Street View) para recorrer el alrededor de la misma forma que en Street View; cuando no hay cobertura se muestra un mensaje de fallback con la foto del grafiti.
- Se agrega un buscador y filtros básicos (barrio, artista, fecha) que reducen los marcadores visibles en el mapa.
- La aplicación se sirve como sitio estático, sin backend en esta primera iteración (los datos viven en un archivo JSON versionado).

## Capabilities

### New Capabilities

- `graffiti-catalog`: catálogo de grafitis de Bogotá: esquema de un registro de grafiti (coordenadas, foto, barrio, autor, fecha) y su carga para que el resto de la aplicación consuma los datos.
- `graffiti-map`: mapa interactivo centrado en Bogotá que despliega un marcador por grafiti, muestra solo los marcadores visibles en el zoom actual y emite la selección al hacer clic.
- `graffiti-search`: buscador y filtros básicos (barrio, artista, fecha) que acotan el conjunto de grafitis mostrados en el mapa.
- `graffiti-detail`: panel de detalle que se abre al seleccionar un grafiti y presenta su foto en grande, sus metadatos y su ubicación.
- `street-view`: vista panorámica del entorno de la calle asociada a un grafiti, con encuadre inicial orientado hacia la ubicación y fallback cuando no hay cobertura.

### Modified Capabilities

(ninguno - el proyecto no tiene specs previas)

## Impact

- **Código nuevo**: toda la aplicación (`src/`), ya que el repositorio está vacío.
- **Dependencias**: `react`, `react-dom`, `vite`, `maplibre-gl`, y la API JavaScript de Google Maps (Street View). Requiere una clave de API de Google Maps con Street View Static/Embed habilitado.
- **Datos**: nuevo archivo `data/graffitis.json` con el catálogo semilla; imágenes de grafitis alojadas en `public/graffitis/`.
- **Configuración**: `.env` con `VITE_GOOGLE_MAPS_API_KEY` (nunca commiteada), `vite.config.js`, `index.html`.
- **Sin cambios**: no se modifica infraestructura existente ni se introduce backend.
