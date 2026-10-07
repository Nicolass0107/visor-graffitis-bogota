# street-view Specification

## Purpose

Permitir recorrer el entorno de la calle donde está un grafiti con una vista panorámica tipo Street View, de la misma forma que se explora una calle en Google Maps.

## Requirements

### Requirement: Panorama del entorno del grafiti
El sistema SHALL mostrar una vista panorámica 360° de la calle correspondiente a la ubicación del grafiti seleccionado, cargada a partir de sus coordenadas.

#### Scenario: Panorama disponible
- **WHEN** el usuario abre la vista del lugar de un grafiti y existe cobertura de Street View en esa calle
- **THEN** se muestra la imagen panorámica de la calle en la ubicación del grafiti

#### Scenario: Recorrer la calle
- **WHEN** el usuario arrastra sobre la vista panorámica
- **THEN** puede mirar alrededor y desplazarse por la calle en ambas direcciones

### Requirement: Orientación hacia el grafiti
El sistema SHALL orientar la cámara panorámica inicial hacia la coordenada exacta del grafiti cuando la vista se abre.

#### Scenario: Vista inicial
- **WHEN** la vista panorámica termina de cargar
- **THEN** la cámara apunta desde la posición de la calle hacia el punto del grafiti

### Requirement: Sin cobertura de Street View
El sistema SHALL mostrar un mensaje explícito de "no hay vista de calle disponible" y SHALL ofrecer la foto del grafiti como alternativa cuando no exista panorama en la ubicación.

#### Scenario: Ubicación sin cobertura
- **WHEN** no hay panoramas de Street View cerca de las coordenadas del grafiti
- **THEN** el panel informa que no hay vista de calle y muestra la foto del grafiti

### Requirement: Clave de API no configurada
El sistema SHALL informar que la vista de calle está no disponible y SHALL mantener operables el mapa y el panel de detalle cuando falte la clave de API de Google Maps.

#### Scenario: Falta la clave
- **WHEN** la aplicación se ejecuta sin la clave de API de Google configurada
- **THEN** aparece un aviso de vista de calle no disponible y el resto de la interfaz funciona con normalidad

### Requirement: Carga de la panorámica
El sistema SHALL mostrar un indicador de carga mientras la vista panorámica se inicializa y SHALL reemplazarlo por la imagen en cuanto esté lista.

#### Scenario: Panorama tardío
- **WHEN** la panorámica tarda en responder
- **THEN** el usuario ve un indicador de carga hasta que la imagen aparece

### Requirement: Vista de calle sin clave mediante enlace externo
Cuando falte la clave de API de Google Maps, el sistema SHALL ofrecer un enlace que abre Street View de Google Maps en una pestaña nueva con las coordenadas del grafiti, como alternativa para ver la calle.

#### Scenario: Enlace visible sin clave
- **WHEN** la aplicación se ejecuta sin la clave de API configurada y el usuario pulsa "Ver el lugar"
- **THEN** junto al aviso de clave faltante aparece un enlace para abrir Street View de Google Maps con las coordenadas del grafiti seleccionado

#### Scenario: Apertura en una pestaña nueva
- **WHEN** el usuario pulsa ese enlace
- **THEN** Street View de Google Maps se abre en una pestaña o ventana nueva apuntando a la ubicación del grafiti, y el visor sigue abierto y operativo en la pestaña original

#### Scenario: Con clave configurada
- **WHEN** sí está configurada la clave de API de Google Maps
- **THEN** el enlace externo no se muestra y la vista de calle se resuelve con la panorámica embebida
