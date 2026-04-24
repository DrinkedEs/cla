export function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readJsonBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1;
}
