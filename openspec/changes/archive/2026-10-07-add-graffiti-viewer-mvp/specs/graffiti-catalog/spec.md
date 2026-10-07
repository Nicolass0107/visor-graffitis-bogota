# Spec Delta

## Purpose

Definir el catálogo de grafitis de Bogotá: qué datos describe cada grafiti y cómo la aplicación los obtiene para poblar el mapa y el panel de detalle.

## ADDED Requirements

### Requirement: Esquema de registro de grafiti
El sistema SHALL representar cada grafiti con un registro que incluya al menos: identificador único, latitud y longitud dentro del área de Bogotá, URL de la foto, barrio, nombre del autor o seudónimo, fecha de registro y título descriptivo.

#### Scenario: Registro completo
- **WHEN** se carga el catálogo
- **THEN** cada grafiti expone id, coordenadas, foto, barrio, autor, fecha y título

#### Scenario: Registro con datos opcionales ausentes
- **WHEN** un grafiti no tiene autor conocido o título
- **THEN** el registro se acepta y esos campos se exponen como vacíos

### Requirement: Carga del catálogo
El sistema SHALL cargar el catálogo de grafitis al iniciar la aplicación y SHALL exponerlo completo al resto de la interfaz antes de pintar los marcadores del mapa.

#### Scenario: Inicio exitoso
- **WHEN** la aplicación termina de cargar
- **THEN** el mapa recibe la lista completa de grafitis del catálogo

#### Scenario: Catálogo no disponible
- **WHEN** el archivo de datos no puede leerse o está mal formado
- **THEN** la aplicación muestra un mensaje de error y no despliega marcadores

### Requirement: Coordenadas válidas
El sistema SHALL descartar los registros cuyas coordenadas no estén dentro del rango geográfico de Bogotá o carezcan de valores numéricos.

#### Scenario: Coordenada inválida
- **WHEN** un registro tiene latitud o longitud no numéricas o fuera de Bogotá
- **THEN** ese grafiti no aparece en el mapa ni en los resultados de búsqueda
