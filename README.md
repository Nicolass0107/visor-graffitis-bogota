# Visor de Grafitis de Bogotá

Visor web para explorar los grafitis de Bogotá sobre un mapa interactivo: al hacer clic en un grafiti se abre su ficha con foto y datos, y con **Ver el lugar** se recorre la calle con una vista panorámica tipo Google Street View.

## Requisitos

- Node.js 20 o superior
- (Opcional) Una clave de API de Google Maps para la vista de calle embebida (sin clave se ofrece un enlace externo equivalente)

## Arranque local

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

### Clave de API de Street View (opcional)

```bash
cp .env.example .env
# Edita .env y pon tu clave en VITE_GOOGLE_MAPS_API_KEY
```

Sin clave, el mapa y el panel de detalle funcionan igual; la vista de calle muestra el aviso "vista de calle no disponible" **y un enlace "Abrir en Street View de Google Maps"** que abre la panorámica en una pestaña nueva con las coordenadas del grafiti, sin necesitar clave ni consumir cuota (ver `src/lib/streetViewUrl.ts`).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga |
| `npm test` | Suite de tests (Vitest + Testing Library) |
| `npm run build` | Type-check y build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |

## Stack

- React + Vite + TypeScript
- MapLibre GL (mapa base con tiles de OpenStreetMap, clusters nativos)
- Google Maps JavaScript API (solo Street View)
- Vitest + Testing Library

## Estructura

```
src/
  data/graffitis.json   # catálogo de grafitis (ver formato abajo)
  catalog/              # carga y validación del catálogo
  filters/              # lógica de búsqueda y filtros
  components/           # mapa, barra de filtros, panel de detalle, vista de calle
  lib/                  # cargador de la librería de Google Maps
public/graffitis/       # fotos reales de los grafitis + atribucion.md
openspec/               # especificaciones del proyecto (OpenSpec)
scripts/                # utilidades (generador de fotos de ejemplo)
```

## Lista de verificación manual (smoke)

Recorrido completo tras un cambio relevante:

1. `npm run dev` → la app abre en el mapa de Bogotá, centrado con zoom de ciudad, y se puede desplazar/zoom.
2. Al alejarse, los marcadores cercanos aparecen agrupados en clusters con su conteo; al acercarse se separan en marcadores individuales.
3. Clic en un marcador → se abre el panel de detalle con foto, título, autor, barrio, fecha, referencia y coordenadas; el marcador queda resaltado.
4. Mientras la foto no carga se ve "Cargando foto…"; al cargar desaparece el indicador.
5. "← Anterior" / "Siguiente →" recorren los grafitis visibles; en los extremos el botón queda deshabilitado y la posición muestra "n / total".
6. "Copiar coordenadas" copia `lat, lng` al portapapeles y muestra "¡Copiado!".
7. "Ver el lugar" abre la vista panorámica:
   - con clave y cobertura → se ve la calle orientada hacia el grafiti y se puede mirar/desplazar;
   - sin cobertura → "No hay vista de calle disponible…" + la foto del grafiti;
   - sin `VITE_GOOGLE_MAPS_API_KEY` → aviso de clave faltante + enlace "Abrir en Street View de Google Maps ↗"; el enlace abre en una pestaña nueva Street View apuntando a las coordenadas del grafiti y la pestaña original queda intacta, con el mapa/panel operativos.
8. Buscador: escribir un texto (p. ej. `sin miedo`) filtra el mapa; un texto sin coincidencias muestra "No hay resultados" y 0 marcadores.
9. Barrio + texto a la vez muestran solo la intersección (p. ej. `Centro Administrativo` + `puerta`); "Restablecer" devuelve el catálogo completo.
10. "Cerrar panel" cierra el panel y ningún marcador queda resaltado.

## Datos: catálogo de grafitis

El catálogo vive en `src/data/graffitis.json` y es un arreglo de registros con este formato (idéntico al archivo real):

```json
[
  {
    "id": "grf-001",
    "lat": 4.598103,
    "lng": -74.075993,
    "foto": "/graffitis/tachas-bolivar-lluvia.jpg",
    "barrio": "Centro Administrativo",
    "autor": "",
    "fecha": "2011-05-29",
    "titulo": "Tachas en el pedestal de Bolívar"
  }
]
```

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `id` | string | sí | Identificador único del grafiti |
| `lat` / `lng` | number | sí | Coordenadas dentro del área de Bogotá (los registros fuera del rango se descartan) |
| `foto` | string | sí | URL pública de la foto, p. ej. `/graffitis/mi-foto.jpg` |
| `barrio` | string | sí | Barrio de Bogotá (en las fotos de ejemplo, el barrio que devuelve la geocodificación inversa de OpenStreetMap) |
| `autor` | string | no | Seudónimo del autor del grafiti; si falta, se expone vacío |
| `fecha` | string | sí | Fecha de registro en formato `YYYY-MM-DD` (en las fotos de ejemplo, la fecha de la foto de origen) |
| `titulo` | string | no | Título descriptivo; si falta, se expone vacío |

- Las fotos se colocan en `public/graffitis/` y se referencian desde `foto` con la ruta absoluta (`/graffitis/archivo.jpg`); se recomienda JPEG ≤ 300 KB.
- Para agregar un grafiti: añade su foto en `public/graffitis/` y su registro en `src/data/graffitis.json`.

### Fotos del catálogo (fotos reales y sus créditos)

Las 10 fotos actuales son **fotos reales de grafitis de Bogotá** tomadas de [Wikimedia Commons](https://commons.wikimedia.org/), con coordenadas y fecha reales de cada archivo fuente. Los créditos obligatorios (fotógrafo, licencia y URL de origen) están en [`public/graffitis/atribucion.md`](public/graffitis/atribucion.md); la licencia es CC BY-SA 3.0/4.0 en todos los casos y las imágenes solo se redimensionaron a 900 px y recomprimieron.

Detalles a tener en cuenta:

- El campo `autor` (seudónimo del artista del grafiti) está vacío en las 10 fichas porque las páginas de Commons no declaran al autor de la obra; el crédito de las **fotos** es el de `atribucion.md`. Si conoces a algún artista, completa `autor` y el filtro de artista empezará a ofrecerlo.
- Las coordenadas son las de la ubicación real de cada foto: 4 en el centro de Bogotá (barrios Centro Administrativo y La Veracruz) y 6 en Ciudad Universitaria (Teusaquillo); por esa concentración, estas 6 aparecen como cluster al alejar el mapa y se separan al acercarse.
- Si prefieres el set de imágenes de ejemplo sin licencia (SVG), se regenera con `node scripts/generate-placeholder-photos.mjs` apuntando el campo `foto` a `/graffitis/grafiti-NN.svg`.
