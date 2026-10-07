# Spec Delta

## Purpose

Permitir al usuario encontrar grafitis rápidamente mediante un buscador de texto y filtros por barrio, artista y fecha, acotando lo que se muestra en el mapa.

## ADDED Requirements

### Requirement: Búsqueda por texto
El sistema SHALL permitir buscar grafitis por texto libre y SHALL filtrar los resultados por coincidencia en título, barrio o autor, sin distinguir mayúsculas de minúsculas.

#### Scenario: Coincidencia por autor
- **WHEN** el usuario escribe el nombre de un autor en el buscador
- **THEN** solo se muestran los marcadores de grafitis de ese autor

#### Scenario: Sin coincidencias
- **WHEN** el texto buscado no coincide con ningún grafiti
- **THEN** el mapa no muestra marcadores y la interfaz indica que no hay resultados

### Requirement: Filtro por barrio
El sistema SHALL ofrecer un selector con los barrios presentes en el catálogo y SHALL mostrar únicamente los marcadores del barrio elegido.

#### Scenario: Barrio seleccionado
- **WHEN** el usuario elige un barrio en el selector
- **THEN** el mapa muestra solo los grafitis de ese barrio

#### Scenario: Todas las opciones
- **WHEN** el usuario elige la opción "Todos" del selector de barrios
- **THEN** el filtro de barrio deja de restringir los marcadores

### Requirement: Filtro por artista
El sistema SHALL ofrecer un selector con los autores presentes en el catálogo y SHALL combinar este filtro con los demás activos.

#### Scenario: Autor y barrio a la vez
- **WHEN** el usuario selecciona un barrio y un autor
- **THEN** solo se muestran los grafitis que cumplen ambas condiciones

### Requirement: Rango de fechas
El sistema SHALL permitir filtrar grafitis por un rango de fechas de registro y SHALL excluir los que caigan fuera del rango.

#### Scenario: Rango aplicado
- **WHEN** el usuario define una fecha inicial y una final
- **THEN** solo se muestran los grafitis registrados dentro de ese intervalo

### Requirement: Restablecer filtros
El sistema SHALL ofrecer un control que limpie búsqueda y filtros, devolviendo el mapa a la vista de todos los grafitis.

#### Scenario: Restablecer
- **WHEN** el usuario activa el control de restablecer
- **THEN** la búsqueda y los filtros se vacían y el mapa vuelve a mostrar todo el catálogo
