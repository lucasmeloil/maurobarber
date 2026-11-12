// Configurações Web Push Nativo VAPID Mauro Barber (100% Autônomo e Gratuito)
export const VAPID_PUBLIC_KEY = 'BAeGhqXE0EssKqX1F7cXXvHDmAKpuG8Hubdy-DWAlp1oeO8rW5XMXt0Tp9J-88Rd0gndu8sqRPjack9PcwlZ8BE';
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'hCVJ9NZZLabPF-vFJY1SLh4azSWLnCrLG32JVytPXbI';
export const VAPID_SUBJECT = 'mailto:contato@maurobarber.com.br';

export function urlBase64ToUint8Array(base64String: string): any {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
