const { cookies } = require('next/headers');

const THEME_COOKIE = 'hct_theme';
const THEMES = ['light', 'dark'];

function getTheme() {
  const value = cookies().get(THEME_COOKIE)?.value;
  return THEMES.includes(value) ? value : 'light';
}

module.exports = { getTheme, THEME_COOKIE, THEMES };
