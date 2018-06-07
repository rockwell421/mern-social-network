//This global method checks if an input is null, undefined, a string, an object. This is so we can validate input easily on the client-side and server-side
const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Objects.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

module.exports = isEmpty;
