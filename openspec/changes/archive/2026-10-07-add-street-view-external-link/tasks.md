# Tasks

## 1. Utilidad de la URL externa

- [x] 1.1 Crear `src/lib/streetViewUrl.ts` con la función pura `streetViewUrl(lat, lng)` que devuelve `https://www.google.com/maps?layer=cbs&cbll={lat},{lng}` con las coordenadas sin redondear, y su test `src/lib/streetViewUrl.test.ts` (URL exacta, longitud negativa y decimales largos como `4.59752178, -74.07463072`); verificar con `npm test -- streetViewUrl` en verde

## 2. Enlace en el panel sin clave

- [x] 2.1 Renderizar dentro del bloque `sin-clave` de `src/components/StreetViewPanel.tsx` un enlace "Abrir en Street View de Google Maps" con `href` generado por `streetViewUrl`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` y `data-testid="abrir-street-view"`, bajo el aviso y con su estilo en `StreetViewPanel.module.css` (columna: texto + enlace); verificar que el aviso original sigue visible en el mismo bloque
- [x] 2.2 Ampliar `src/components/StreetViewPanel.test.tsx` con: enlace presente en `sin-clave` apuntando a las coordenadas del grafiti y con `target="_blank"`/`rel="noopener noreferrer"`; enlace ausente cuando hay clave con cobertura y en el estado `sin-cobertura`; verificar con `npm test -- StreetViewPanel` en verde
- [x] 2.3 Documentar la alternativa en `README.md` (sección de "Ver el lugar": sin clave ahora aparece el enlace a Street View de Google Maps) y añadir el paso al checklist de humo; verificar que la sección describe lo que muestra la app

## 3. Verificación integral

- [x] 3.1 Ejecutar `npm test` completo y verificar 0 fallos (suite de 8+ archivos)
- [x] 3.2 Ejecutar `npm run build` y verificar que termina sin errores de type-check ni de build
- [x] 3.3 Hacer humo en el navegador con `npm run dev` y sin `.env`: "Ver el lugar" → aviso de clave + enlace visible; pulsar el enlace abre Street View de Google Maps en una pestaña nueva en las coordenadas del grafiti (si el deeplink no cae en Street View, cambiar `streetViewUrl` a la variante `cbp=11,0,0,0,0` de design.md y actualizar su test); mapa y panel siguen operativos y la consola queda sin errores

## Workflow follow-up

- Ejecutar `openspec validate --change "add-street-view-external-link" --strict` antes de implementar/durante la revisión.
- Cuando la implementación esté revisada, archivar el cambio con `openspec archive` y verificar con `openspec list --specs` que el requisito nuevo aparece en `street-view`.
