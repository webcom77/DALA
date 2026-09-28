/**
 * Utilitários de Formatação Brasileira (pt-BR / BRL / America/Sao_Paulo)
 */

export const BRAZIL_TIMEZONE = "America/Sao_Paulo";
export const BRAZIL_LOCALE = "pt-BR";

/**
 * Formata um valor numérico em Real Brasileiro (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(BRAZIL_LOCALE, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Converte entradas variadas em objeto Date seguro
 */
function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date);
}

/**
 * Formata uma data no padrão DD/MM/AAAA no fuso horário America/Sao_Paulo
 */
export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toDate(date));
}

/**
 * Formata um horário no padrão HH:mm no fuso horário America/Sao_Paulo
 */
export function formatTime(date: Date | string | number): string {
  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(toDate(date));
}

/**
 * Formata data e hora no padrão "DD/MM/AAAA às HH:mm"
 */
export function formatDateTime(date: Date | string | number): string {
  const d = toDate(date);
  const formattedDate = formatDate(d);
  const formattedTime = formatTime(d);
  return `${formattedDate} às ${formattedTime}`;
}

/**
 * Formata uma data por extenso no padrão brasileiro (ex: "Segunda-feira, 28 de setembro de 2026")
 */
export function formatDateLong(date: Date | string | number = new Date()): string {
  return new Intl.DateTimeFormat(BRAZIL_LOCALE, {
    timeZone: BRAZIL_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(date));
}
