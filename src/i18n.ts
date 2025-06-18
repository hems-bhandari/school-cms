export const locales = ['en', 'ne'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export interface Messages {
  [key: string]: string | Messages;
}

export async function getMessages(locale: Locale): Promise<Messages> {
  try {
    return (await import(`../messages/${locale}.json`)).default;
  } catch {
    console.warn(`Failed to load messages for locale: ${locale}`);
    return {};
  }
}
