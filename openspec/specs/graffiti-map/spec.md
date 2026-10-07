# graffiti-map Specification

## Purpose

Mostrar un mapa interactivo de Bogotá como pantalla principal del visor, con un marcador por cada grafiti y selección de grafiti al hacer clic.

## Requirements

### Requirement: Mapa centrado en Bogotá
El sistema SHALL presentar un mapa interactivo inicialmente centrado en Bogotá, con controles de zoom y desplazamiento habilitados.

#### Scenario: Primera carga
- **WHEN** el usuario abre la aplicación
- **THEN** ve el mapa de Bogotá con zoom de ciudad y puede desplazarlo y ampliarlo

### Requirement: Marcadores de grafitis
El sistema SHALL dibujar un marcador por cada grafiti del catálogo en su coordenada exacta y SHALL mostrar el identificador del grafiti al pasar el cursor sobre el marcador.

#### Scenario: Marcador visible
- **WHEN** el mapa está en vista de ciudad y hay grafitis en el catálogo
- **THEN** cada grafiti aparece como un marcador en su ubicación

#### Scenario: Cursor sobre marcador
- **WHEN** el usuario pasa el cursor sobre un marcador
- **THEN** el marcador resalta y muestra su identificador

### Requirement: Selección de grafiti por clic
El sistema SHALL abrir el panel de detalle del grafiti cuando el usuario haga clic en su marcador, y SHALL marcar el marcador como seleccionado mientras el panel esté abierto.

#### Scenario: Clic en un marcador
- **WHEN** el usuario hace clic en un marcador
- **THEN** se abre el panel de detalle de ese grafiti y el marcador queda resaltado

#### Scenario: Cambio de selección
- **WHEN** el usuario hace clic en otro marcador con el panel abierto
- **THEN** el panel muestra el grafiti recién seleccionado y el marcador anterior deja de estar resaltado

### Requirement: Cierre del panel
El sistema SHALL cerrar el panel de detalle y deseleccionar el marcador cuando el usuario active el control de cierre.

#### Scenario: Cierre del panel
- **WHEN** el usuario hace clic en el botón de cerrar del panel
- **THEN** el panel desaparece y ningún marcador queda resaltado

### Requirement: Navegación por niveles de zoom
El sistema SHALL agrupar los marcadores cercanos cuando el mapa está muy alejado y SHALL separarlos en marcadores individuales al acercar el mapa.

#### Scenario: Vista alejada
- **WHEN** el mapa está en un nivel de zoom bajo
- **THEN** los marcadores cercanos se agrupan en clusters que indican cuántos grafitis contienen

#### Scenario: Vista acercada
- **WHEN** el usuario amplía el mapa sobre una agrupación
- **THEN** los grafitis se muestran como marcadores individuales
