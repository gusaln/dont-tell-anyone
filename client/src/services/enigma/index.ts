import { ALPHABET, MAX, MIN } from "./const";
import { Reflector, reflectors, Rotor, rotors } from "./rotor";
import { LetterMap, NotchMap, ReflectorDefinition, RotorDefinition } from "./types";

export type EnigmaType = "army" | "m3" | "m4" | "swiss" | "railway" | "commercial" | "custom";
// export type NotchMap = Record<number, boolean>;
export type StepFn = (rotorIndex: number, letterIndex: number, newLetterIndex: number) => unknown;
export type Dictionary = any[];

export function getAllRotors() {
  return rotors;
}

export function getAllReflectors() {
  return reflectors;
}

export function getLetterIndex(alphabet: string[], l: string) {
  return alphabet.indexOf(l);
}

export function upperCap(n: number) {
  return n > MAX ? n - MAX - 1 : n;
}

export function lowerCap(n: number) {
  return n < MIN ? n + MAX + 1 : n;
}

export function cap(n: number) {
  return lowerCap(upperCap(n));
}

export class Enigma {
  private rotors: Rotor[];
  private reflector: Reflector;
  private rotorsOffset: number[];
  private _forwardsDictionaries: Dictionary[];
  private _backwardsDictionaries: Dictionary[];
  private _reflectorDictionary: LetterMap;
  private notchesMap: NotchMap[];

  constructor(rotors: RotorDefinition[], reflector: ReflectorDefinition) {
    this.rotors = rotors.map((rotor) => Rotor.fromDefinition(rotor));
    this.reflector = Reflector.fromDefinition(reflector);
    this.rotorsOffset = rotors.map(() => 0);
    this._forwardsDictionaries = [];
    this._backwardsDictionaries = [];
    this._reflectorDictionary = {};
    this.notchesMap = [];

    this.generateMaps();
  }

  public getRotors(): RotorDefinition[] {
    return this.rotors.map((r) => r.toDefinition());
  }

  public getReflector(): ReflectorDefinition {
    return this.reflector.toDefinition();
  }

  public getOffsets(): number[] {
    return this.rotorsOffset.slice();
  }

  public getRotorDictionary(i: number): LetterMap {
    return this._forwardsDictionaries[i][0];
  }

  public getReflectorDictionary(): LetterMap {
    return this._reflectorDictionary;
  }

  public getType(): EnigmaType {
    const series = this.rotors
      .map((r) => r.series as EnigmaType)
      .reduce((prev, curr) => {
        if (prev.includes(curr)) return prev;
        prev.push(curr);
        return prev;
      }, [] as EnigmaType[]);

    if (series.length > 1) {
      return "custom";
    }

    return series[0] as EnigmaType;
  }

  public setRotor(i: number, rotor: RotorDefinition) {
    this.rotors[i] = Rotor.fromDefinition(rotor);

    this.generateMaps();
  }

  public setRotors(rotors: RotorDefinition[]) {
    this.rotors = rotors.map((rotor) => Rotor.fromDefinition(rotor));

    this.generateMaps();
  }

  public setReflector(reflector: ReflectorDefinition) {
    this.reflector = Reflector.fromDefinition(reflector);

    this.generateMaps();
  }

  public setOffsets(offsets: number[] = []) {
    offsets.forEach((offset, i) => (this.rotorsOffset[i] = offset));
  }

  public setOffset(i: number, offset: number) {
    this.rotorsOffset[i] = offset;
  }

  public toString() {
    const parts = this.rotors.map((r) => r.name);
    parts.push(this.reflector.name);
    return parts.join(", ");
  }

  private generateMaps() {
    const rotorEntries = this.rotors.map((rotor, i) => [rotor, i]);

    this._forwardsDictionaries = rotorEntries.map(([rotor, i]) => [
      (rotor as Rotor).getForwardsLetterMap(),
      i,
    ]);
    this._backwardsDictionaries = rotorEntries
      .reverse()
      .map(([rotor, i]) => [(rotor as Rotor).getBackwardsLetterMap(), i]);
    this._reflectorDictionary = this.reflector.getForwardsLetterMap();
    this.notchesMap = this.rotors.map((rotor) =>
      Object.fromEntries(rotor.notches.map((notch) => [notch, true]))
    );
  }

  /**
   * Moves one rotor one positions forwards.
   *
   * If the movement involves a notch, it will also move the next rotor.
   */
  public rotateForwards(rotorIndex = 0) {
    let p = this.rotorsOffset[rotorIndex];

    if (p < MAX) {
      this.rotorsOffset[rotorIndex] = ++p;
    } else {
      this.rotorsOffset[rotorIndex] = p = MIN;
    }

    if (rotorIndex < this.rotors.length - 1 && this.notchesMap[rotorIndex][p]) {
      this.rotateForwards(rotorIndex + 1);
    }
  }

  /**
   * Moves one rotor one positions backwards.
   *
   * This operation is an inverse of `rotateForwards` which means that it will revert any movements due to notches.
   */
  public rotateBackwards(rotorIndex = 0) {
    let p = this.rotorsOffset[rotorIndex];

    if (p > MIN) {
      this.rotorsOffset[rotorIndex] = --p;
    } else {
      this.rotorsOffset[rotorIndex] = p = MAX;
    }

    if (rotorIndex < this.rotors.length - 1 && this.notchesMap[rotorIndex][p + 1]) {
      this.rotateBackwards(rotorIndex + 1);
    }
  }

  private passThrough(dictionaries: any[], letterIndex: number, stepCb: Function) {
    dictionaries.forEach(([dictionary, rotorIndex]) => {
      let offset = this.rotorsOffset[rotorIndex];
      let newIndex = lowerCap(dictionary[upperCap(letterIndex + offset)] - offset);
      stepCb(rotorIndex, letterIndex, newIndex);
      letterIndex = newIndex;
    });

    return letterIndex;
  }

  public encode(letter: string, stepsCb: StepFn = () => {}) {
    letter = letter.toUpperCase();

    let letterIndex = ALPHABET.indexOf(letter);
    if (letterIndex < 0) {
      return letter;
    }

    this.rotateForwards();

    letterIndex = this.passThrough(this._forwardsDictionaries, letterIndex, stepsCb);
    let newIndex = this._reflectorDictionary[letterIndex];
    stepsCb(-1, letterIndex, newIndex);
    letterIndex = newIndex;
    letterIndex = this.passThrough(this._backwardsDictionaries, letterIndex, stepsCb);

    return ALPHABET[letterIndex];
  }

  public encodeMessage(message: string) {
    return message
      .split("")
      .map((letter) => this.encode(letter))
      .join("");
  }
}

export * from "./const";
export * from "./types";
