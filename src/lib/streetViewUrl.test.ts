import { streetViewUrl } from './streetViewUrl';

describe('streetViewUrl', () => {
  it('genera el deeplink de Street View con las coordenadas dadas', () => {
    expect(streetViewUrl(4.6486, -74.0564)).toBe(
      'https://www.google.com/maps?layer=cbs&cbll=4.6486,-74.0564',
    );
  });

  it('conserva los decimales largos sin redondear', () => {
    expect(streetViewUrl(4.59752178, -74.07463072)).toBe(
      'https://www.google.com/maps?layer=cbs&cbll=4.59752178,-74.07463072',
    );
  });

  it('mantiene la longitud negativa propia de Bogotá', () => {
    expect(streetViewUrl(-33.9, -70.7)).toBe(
      'https://www.google.com/maps?layer=cbs&cbll=-33.9,-70.7',
    );
  });

  it('apunta a Street View de Google (sin claves de API en la URL)', () => {
    const url = streetViewUrl(4.6, -74.05);
    expect(url).toContain('www.google.com/maps');
    expect(url).toContain('layer=cbs');
    expect(url).not.toMatch(/key=|cbll=[^,]*%20/);
  });
});
