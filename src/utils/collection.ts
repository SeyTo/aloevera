export function getKeys<K, V>(map: Map<K, V>): K[] {
  let k = []
  for (let key in map) {
    k.push(key)
  }
  return k;
}
