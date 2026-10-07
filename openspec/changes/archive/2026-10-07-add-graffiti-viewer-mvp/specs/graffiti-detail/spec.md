# Spec Delta

## Purpose

Mostrar la información completa de un grafiti seleccionado: su foto en grande, sus metadatos, su ubicación y el acceso a la vista del lugar.

## ADDED Requirements

### Requirement: Panel de detalle con foto y metadatos
El sistema SHALL mostrar, al seleccionar un grafiti, un panel con su foto en tamaño grande, título, autor, barrio, fecha de registro y dirección o referencia de ubicación.

#### Scenario: Grafiti seleccionado
- **WHEN** el usuario hace clic en el marcador de un grafiti
- **THEN** el panel muestra su foto junto con título, autor, barrio, fecha y ubicación

#### Scenario: Foto pendiente de carga
- **WHEN** la imagen del grafiti aún no termina de cargar
- **THEN** el panel muestra un indicador de carga en el espacio de la foto

### Requirement: Acceso a la vista del lugar
El sistema SHALL incluir en el panel un control que abra la vista panorámica del entorno de ese grafiti.

#### Scenario: Abrir vista del lugar
- **WHEN** el usuario activa el control de vista del lugar
- **THEN** la aplicación muestra la vista panorámica de la calle correspondiente a ese grafiti

### Requirement: Navegación entre grafitis
El sistema SHALL permitir avanzar y retroceder al grafiti anterior o siguiente dentro del conjunto de grafitis actualmente visibles en el mapa.

#### Scenario: Siguiente grafiti
- **WHEN** el usuario activa el control de siguiente con varios grafitis visibles
- **THEN** el panel carga el siguiente grafiti del conjunto visible

#### Scenario: Último grafiti
- **WHEN** el usuario está en el último grafiti del conjunto visible
- **THEN** el control de siguiente está deshabilitado o regresa al primero

### Requirement: Compartir ubicación
El sistema SHALL mostrar en el panel las coordenadas del grafiti y SHALL permitir copiarlas al portapapeles con un control.

#### Scenario: Copiar coordenadas
- **WHEN** el usuario activa el control de copiar coordenadas
- **THEN** las coordenadas del grafiti quedan copiadas al portapapeles y se confirma la acción
