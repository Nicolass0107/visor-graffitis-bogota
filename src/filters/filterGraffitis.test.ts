import {
  EMPTY_FILTERS,
  filterGraffitis,
  uniqueAutores,
  uniqueBarrios,
  type FilterState,
} from './filterGraffitis';
import type { Graffiti } from '../types';

const SAMPLE: Graffiti[] = [
  {
    id: 'grf-001',
    lat: 4.5981,
    lng: -74.0758,
    foto: '/graffitis/grafiti-01.svg',
    barrio: 'La Candelaria',
    autor: 'Tinta Sur',
    fecha: '2024-03-12',
    titulo: 'Mural del callejón',
  },
  {
    id: 'grf-002',
    lat: 4.6486,
    lng: -74.0564,
    foto: '/graffitis/grafiti-02.svg',
    barrio: 'Chapinero',
    autor: 'Roka',
    fecha: '2024-05-02',
    titulo: 'León de Chapinero',
  },
  {
    id: 'grf-003',
    lat: 4.6195,
    lng: -74.0925,
    foto: '/graffitis/grafiti-03.svg',
    barrio: 'Chapinero',
    autor: 'Roka',
    fecha: '2025-01-18',
    titulo: 'Frases de la 24',
  },
  {
    id: 'grf-004',
    lat: 4.7019,
    lng: -74.0465,
    foto: '/graffitis/grafiti-04.svg',
    barrio: 'Usaquén',
    autor: '',
    fecha: '2024-07-30',
    titulo: 'Correspondencia norte',
  },
];

const ids = (filters: Partial<FilterState>) =>
  filterGraffitis(SAMPLE, { ...EMPTY_FILTERS, ...filters }).map((g) => g.id);

describe('filterGraffitis', () => {
  it('sin filtros devuelve todo el catálogo', () => {
    expect(filterGraffitis(SAMPLE, EMPTY_FILTERS)).toHaveLength(4);
  });

  it('busca por texto en título, barrio o autor sin distinguir mayúsculas', () => {
    expect(ids({ texto: 'ROKA' })).toEqual(['grf-002', 'grf-003']);
    expect(ids({ texto: 'candelaria' })).toEqual(['grf-001']);
    expect(ids({ texto: 'LEÓN' })).toEqual(['grf-002']);
  });

  it('filtra por barrio', () => {
    expect(ids({ barrio: 'Chapinero' })).toEqual(['grf-002', 'grf-003']);
  });

  it('filtra por autor', () => {
    expect(ids({ autor: 'Tinta Sur' })).toEqual(['grf-001']);
  });

  it('filtra por rango de fechas inclusive', () => {
    expect(ids({ desde: '2024-05-02', hasta: '2024-12-31' })).toEqual([
      'grf-002',
      'grf-004',
    ]);
    expect(ids({ hasta: '2024-03-12' })).toEqual(['grf-001']);
  });

  it('combina barrio y autor por intersección', () => {
    expect(ids({ barrio: 'Chapinero', autor: 'Roka' })).toEqual(['grf-002', 'grf-003']);
    expect(ids({ barrio: 'Chapinero', autor: 'Tinta Sur' })).toEqual([]);
  });

  it('combina texto con el resto de filtros', () => {
    expect(ids({ texto: 'frases', barrio: 'Chapinero', autor: 'Roka' })).toEqual(['grf-003']);
  });

  it('devuelve vacío cuando nada coincide', () => {
    expect(ids({ texto: 'texto inexistente' })).toEqual([]);
  });
});

describe('opciones de los selectores', () => {
  it('lista barrios y autores únicos y ordenados, sin autores vacíos', () => {
    expect(uniqueBarrios(SAMPLE)).toEqual(['Chapinero', 'La Candelaria', 'Usaquén']);
    expect(uniqueAutores(SAMPLE)).toEqual(['Roka', 'Tinta Sur']);
  });
});
