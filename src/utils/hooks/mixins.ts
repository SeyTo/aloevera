function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name))
    })
  })
}

class MapExtension {
  getKeys() {
    let keys = []
    for (let key in this.keys()) {
      keys.push(key)
    }
    return keys;
  }
}

applyMixins(Map, [MapExtension])
