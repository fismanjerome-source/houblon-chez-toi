const { cookies } = require('next/headers');

const LOCALE_COOKIE = 'hct_locale';
const LOCALES = ['fr', 'nl'];

function getLocale() {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return LOCALES.includes(value) ? value : 'fr';
}

// Retombe sur le français si la traduction néerlandaise d'un champ est absente.
function pick(locale, nl, fr) {
  return locale === 'nl' && nl ? nl : fr;
}

module.exports = { getLocale, pick, LOCALE_COOKIE, LOCALES };
