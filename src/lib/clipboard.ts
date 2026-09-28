/**
 * Robust clipboard copy utility supporting both modern secure contexts (HTTPS / localhost)
 * and non-secure LAN contexts (HTTP over private IP addresses like http://192.168.0.200).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try Navigator Clipboard API if available and permitted (Secure Context / HTTPS / localhost)
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to DOM fallback on permission denial or insecure context error
    }
  }

  // 2. Fallback using temporary off-screen textarea with document.execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      // Position offscreen so it does not trigger any viewport jump
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}
