import { copyTextToClipboard } from './copyTextToClipboard';

describe('copyTextToClipboard', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard');
    Reflect.deleteProperty(document, 'execCommand');
  });

  it('usa la Clipboard API cuando está disponible', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await copyTextToClipboard('4.6, -74.08');

    expect(writeText).toHaveBeenCalledWith('4.6, -74.08');
  });

  it('usa el respaldo con execCommand cuando la Clipboard API es rechazada', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn(() => true);
    Object.assign(document, { execCommand });

    await copyTextToClipboard('hola mundo');

    expect(execCommand).toHaveBeenCalledWith('copy');
    // El textarea temporal no queda en el documento.
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('usa el respaldo cuando no existe la Clipboard API', async () => {
    const execCommand = vi.fn(() => true);
    Object.assign(document, { execCommand });

    await copyTextToClipboard('sin api');

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('lanza error cuando ninguna de las dos vías funciona', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.assign(navigator, { clipboard: { writeText } });
    const execCommand = vi.fn(() => false);
    Object.assign(document, { execCommand });

    await expect(copyTextToClipboard('no se puede')).rejects.toThrow('copy-failed');
    expect(document.querySelector('textarea')).toBeNull();
  });
});
