function normalizeWhitespace(string) {
  return string.replace(/\n/g, '').replace(/\s+/g, ' ');
}

export { normalizeWhitespace };
