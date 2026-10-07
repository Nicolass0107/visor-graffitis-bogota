# Spec Delta

## ADDED Requirements

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
