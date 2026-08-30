// Genera una contrasena aleatoria que cumple las mismas reglas de complejidad
// que se validan en el frontend (mayuscula, minuscula, numero, caracter especial, min. 8).
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function randomChar(charset) {
  return charset[Math.floor(Math.random() * charset.length)];
}

export function generatePassword(length = 12) {
  const required = [
    randomChar(UPPER),
    randomChar(LOWER),
    randomChar(DIGITS),
    randomChar(SYMBOLS),
  ];

  const rest = Array.from({ length: length - required.length }, () => randomChar(ALL));

  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}
