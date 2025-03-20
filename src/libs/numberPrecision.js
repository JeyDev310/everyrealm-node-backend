import np from 'number-precision'
np.enableBoundaryChecking(false)

export class NumberPrecision {
  static #precision = 9

  static round (number) {
    return np.round(number, this.#precision)
  }

  static plus () {
    return np.plus(...arguments)
  }

  static divide () {
    return this.round(np.divide(...arguments))
  }

  static minus () {
    return np.minus(...arguments)
  }

  static times () {
    return this.round(np.times(...arguments))
  }
}
