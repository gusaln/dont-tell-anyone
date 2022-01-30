/**
 * Generates a class string
 *
 * @param {Record<string,boolean>} classes
 * @param {string} staticClasses Classes that always apply
 */
export function classname(classes: Record<string, boolean>, staticClasses = "") {
  return Object.entries(classes)
    .filter(([_, condition]) => condition)
    .map(([classname]) => classname)
    .concat([staticClasses])
    .join(" ");
}
