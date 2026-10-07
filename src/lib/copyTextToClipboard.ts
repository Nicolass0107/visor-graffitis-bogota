/**
 * Copia `text` al portapapeles.
 *
 * Intenta primero la Clipboard API (`navigator.clipboard`). Si no existe o el
 * permiso está denegado, recurre a un `textarea` temporal con
 * `document.execCommand('copy')`, que no requiere permiso.
 *
 * Lanza un error cuando ninguna de las dos vías funciona.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permiso denegado o API bloqueada: se intenta el respaldo.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }

  if (!copied) throw new Error('copy-failed');
}
