/**
 * Dobles de mapa para tests: reemplazan a `maplibre-gl` (WebGL no existe en jsdom).
 * Exponen los mismos puntos de entrada que usa MapCanvas para poder simular
 * carga, clics y cambios de datos.
 */

export class FakePopup {
  static instances: FakePopup[] = [];

  lngLat: unknown = null;
  html = '';
  addedTo: unknown = null;
  removed = false;

  constructor() {
    FakePopup.instances.push(this);
  }

  static reset() {
    FakePopup.instances = [];
  }

  setLngLat(value: unknown) {
    this.lngLat = value;
    return this;
  }

  setHTML(html: string) {
    this.html = html;
    return this;
  }

  addTo(map: unknown) {
    this.addedTo = map;
    return this;
  }

  remove() {
    this.removed = true;
    return this;
  }
}

export class FakeSource {
  config: Record<string, unknown>;
  data: unknown;
  expansionZoom = 14;

  constructor(config: Record<string, unknown>) {
    this.config = config;
    this.data = config.data;
  }

  setData(data: unknown) {
    this.data = data;
  }

  getClusterExpansionZoom(_clusterId: number): Promise<number> {
    return Promise.resolve(this.expansionZoom);
  }
}

type Handler = { layer?: string; fn: (event: unknown) => void };

export class FakeMap {
  static instances: FakeMap[] = [];

  options: Record<string, unknown>;
  handlers: Record<string, Handler[]> = {};
  sources: Record<string, FakeSource> = {};
  layerIds: string[] = [];
  layers: Array<Record<string, unknown>> = [];
  filters: Record<string, unknown[]> = {};
  controls: unknown[] = [];
  easeToCalls: Array<Record<string, unknown>> = [];
  featureStates: Array<Record<string, unknown>> = [];
  removed = false;
  canvas = { style: { cursor: '' } };

  constructor(options: Record<string, unknown>) {
    this.options = options;
    FakeMap.instances.push(this);
  }

  static reset() {
    FakeMap.instances = [];
  }

  static get last(): FakeMap {
    const map = FakeMap.instances.at(-1);
    if (!map) throw new Error('No hay un mapa FakeMap creado todavía');
    return map;
  }

  addControl(control: unknown) {
    this.controls.push(control);
  }

  on(event: string, layerOrFn: unknown, maybeFn?: unknown) {
    const fn = (typeof layerOrFn === 'function' ? layerOrFn : maybeFn) as
      | ((event: unknown) => void)
      | undefined;
    const layer = typeof layerOrFn === 'string' ? layerOrFn : undefined;
    if (typeof fn !== 'function') return;
    (this.handlers[event] ??= []).push({ layer, fn });
  }

  once(event: string, layerOrFn: unknown, maybeFn?: unknown) {
    this.on(event, layerOrFn, maybeFn);
  }

  addSource(id: string, config: Record<string, unknown>) {
    this.sources[id] = new FakeSource(config);
  }

  getSource(id: string) {
    return this.sources[id];
  }

  addLayer(layer: Record<string, unknown>) {
    this.layers.push(layer);
    this.layerIds.push(String(layer.id));
  }

  setFilter(layerId: string, filter: unknown[]) {
    this.filters[layerId] = filter;
  }

  easeTo(options: Record<string, unknown>) {
    this.easeToCalls.push(options);
  }

  setFeatureState(target: unknown, state: unknown) {
    this.featureStates.push({ op: 'set', target, state });
  }

  removeFeatureState(target: unknown, state?: unknown) {
    this.featureStates.push({ op: 'remove', target, state });
  }

  getCanvas() {
    return this.canvas;
  }

  remove() {
    this.removed = true;
  }

  /** Dispara el handler de `event` registrado para una capa. */
  fireLayer(event: string, layer: string, payload: unknown) {
    for (const handler of this.handlers[event] ?? []) {
      if (handler.layer === layer) handler.fn(payload);
    }
  }

  /** Dispara todos los handlers de `event` (p. ej. `load`). */
  fire(event: string, payload: unknown = undefined) {
    for (const handler of this.handlers[event] ?? []) handler.fn(payload);
  }
}
