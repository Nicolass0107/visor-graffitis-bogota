# Tasks

## 1. Andamiaje del proyecto

- [x] 1.1 Crear el scaffold de Vite + React + TypeScript en la raíz del repo y agregar `maplibre-gl`; verificar que `npm install` termina bien y `npm run dev` sirve la app en el navegador
- [x] 1.2 Agregar Vitest + Testing Library y un primer test de humo del componente App; verificar que `npm test` pasa
- [x] 1.3 Crear `.env.example` con `VITE_GOOGLE_MAPS_API_KEY`, `.gitignore` que excluya `.env` y `node_modules`, y README con instrucciones de arranque local; verificar que siguiendo el README arranca la app sin errores
- [x] 1.4 Documentar en el README el formato de datos del catálogo (`graffitis.json`) y el hecho de que las fotos van en `public/graffitis/`; verificar que el ejemplo documentado coincide con el archivo real

## 2. Catálogo de grafitis (graffiti-catalog)

- [x] 2.1 Definir el tipo `Graffiti` y crear `src/data/graffitis.json` con ~10 grafitis semilla de Bogotá (coordenadas, foto, barrio, autor, fecha, título); verificar con un test que el catálogo cargado tiene registros completos
- [x] 2.2 Implementar `loadCatalog()` con validación de coordenadas dentro de Bogotá y manejo de catálogo malformado; verificar con tests unitarios: registro válido, coordenada inválida descartada, JSON corrupto ⇒ estado de error
- [x] 2.3 Poblar fotos de ejemplo en `public/graffitis/`; verificar que las URLs de foto de cada registro del catálogo resuelven con HTTP 200 en `npm run dev`

## 3. Mapa y marcadores (graffiti-map)

- [x] 3.1 Implementar el componente de mapa MapLibre centrado en Bogotá con tiles y controles de zoom/desplazamiento; verificar con un test de render que el contenedor del mapa se monta y con inspección manual que Bogotá queda centrada
- [x] 3.2 Agregar source GeoJSON con clusterización y capas de clusters/etiquetas, con tooltip del id al pasar el cursor; verificar con tests: un marcador por grafiti y clusters en zoom bajo / individuales en zoom alto
- [x] 3.3 Conectar el clic del marcador al estado de selección (abre panel, marca marcador, cambio de selección) y el botón de cerrar (limpia selección); verificar con tests de interacción los tres flujos

## 4. Búsqueda y filtros (graffiti-search)

- [x] 4.1 Implementar la lógica de filtrado (texto sobre título/barrio/autor sin distinguir mayúsculas, barrio, autor, rango de fechas, combinación de filtros) en un selector con `useMemo`; verificar con tests unitarios cada filtro por separado y combinados
- [x] 4.2 Construir la barra de búsqueda, los selects de barrio/autor (con opción "Todos"), el rango de fechas y el control de restablecer; verificar con tests de integración que la selección de un barrio y un autor a la vez muestra solo la intersección y que "restablecer" devuelve todo el catálogo
- [x] 4.3 Implementar el estado sin resultados ("no hay resultados"); verificar con un test de texto sin coincidencias que el mapa queda sin marcadores y aparece el mensaje

## 5. Panel de detalle (graffiti-detail)

- [x] 5.1 Construir el panel con foto grande, título, autor, barrio, fecha y ubicación, más indicador de carga de la imagen; verificar con tests que al seleccionar un grafiti se muestran sus datos y que la foto pendiente muestra el indicador
- [x] 5.2 Implementar la navegación anterior/siguiente sobre el conjunto visible, con control deshabilitado o cíclico en los extremos; verificar con tests los casos "siguiente" y "último grafiti"
- [x] 5.3 Agregar el control de copiar coordenadas con confirmación visual; verificar con test que al activarlo se copian las coordenadas exactas al portapapeles
- [x] 5.4 Agregar el control "Ver el lugar" que dispara la vista panorámica del grafiti seleccionado; verificar con un test que el clic abre la vista con la coordenada correcta

## 6. Vista de calle (street-view)

- [x] 6.1 Implementar el loader dinámico de la librería de Google Maps con la clave desde `VITE_GOOGLE_MAPS_API_KEY` y el estado "clave no configurada"; verificar con tests que sin clave se muestra el aviso y el mapa y panel siguen operativos
- [x] 6.2 Montar `StreetViewPanorama` en las coordenadas del grafiti con orientación inicial hacia el punto e indicador de carga; verificar con tests (mock del loader) que la cámara queda orientada al grafiti y que el indicador se reemplaza al estar lista
- [x] 6.3 Verificar cobertura con `StreetViewService` y aplicar el fallback: sin panorama ⇒ mensaje "no hay vista de calle disponible" + foto del grafiti; verificar con tests los casos con y sin cobertura

## 7. Verificación final

- [x] 7.1 Correr la suite completa (`npm test`) y la build de producción (`npm run build`); verificar que ambos terminan sin errores
- [x] 7.2 Hacer el recorrido manual de humo con el checklist del README: mapa de Bogotá → clusters → clic en marcador → panel con foto → "Ver el lugar" → Street View → filtros → sin resultados → sin clave de API; verificar que cada paso se comporta según su spec

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied (`openspec archive add-graffiti-viewer-mvp`).
- Verify the archived result.
