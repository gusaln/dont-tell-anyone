import { ALPHABET, EncodingCache, MAX_LETTER_INDEX, MIN_LETTER_INDEX, NotchMap, Step } from ".";
import { reflectors, rotors } from "./rotor";

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
  return n > MAX_LETTER_INDEX ? n - MAX_LETTER_INDEX - 1 : n;
}

export function lowerCap(n: number) {
  return n < MIN_LETTER_INDEX ? n + MAX_LETTER_INDEX + 1 : n;
}

export function cap(n: number) {
  return lowerCap(upperCap(n));
}

export function isInAlphabet(letter: string) {
  return ALPHABET.indexOf(letter) != -1;
}

export function encode(
  machineState: EncodingCache,
  offsets: number[],
  letter: string
): [string, Step[]] {
  letter = letter.toUpperCase();

  let letterIndex = ALPHABET.indexOf(letter);

  const path: Step[] = [];

  // letterIndex = this.passThrough(this._forwardsDictionaries, letterIndex, stepsCb);

  machineState.rotorsDict.forwards.forEach(([dictionary, rotorIndex]) => {
    let offset = offsets[rotorIndex];
    let newIndex = lowerCap(dictionary[upperCap(letterIndex + offset)] - offset);
    path.push({ rotorIndex, plaintextIndex: letterIndex, cyphertextIndex: newIndex });
    letterIndex = newIndex;
  });

  let newIndex = machineState.reflectorDict[letterIndex];
  path.push({ rotorIndex: -1, plaintextIndex: letterIndex, cyphertextIndex: newIndex });
  letterIndex = newIndex;

  machineState.rotorsDict.backwards.forEach(([dictionary, rotorIndex]) => {
    let offset = offsets[rotorIndex];
    let newIndex = lowerCap(dictionary[upperCap(letterIndex + offset)] - offset);
    path.push({ rotorIndex, plaintextIndex: letterIndex, cyphertextIndex: newIndex });
    letterIndex = newIndex;
  });

  return [ALPHABET[letterIndex], path];
}

export function rotateForwards(
  rotorsOffset: number[],
  notchesMap: NotchMap[],
  maxRotorIndex: number
) {
  let newRotorsOffsets = rotorsOffset.slice();

  let cursor = 0;
  do {
    let p = newRotorsOffsets[cursor];

    if (p < MAX_LETTER_INDEX) {
      newRotorsOffsets[cursor] = ++p;
    } else {
      newRotorsOffsets[cursor] = p = MIN_LETTER_INDEX;
    }

    if (!notchesMap[cursor][p]) {
      break;
    }

    cursor++;
  } while (cursor < maxRotorIndex);

  return newRotorsOffsets;
}

export function rotateBackwards(
  rotorsOffset: number[],
  notchesMap: NotchMap[],
  maxRotorIndex: number
) {
  let newRotorsOffsets = rotorsOffset.slice();

  let cursor = 0;
  do {
    let p = newRotorsOffsets[cursor];

    if (p > MIN_LETTER_INDEX) {
      newRotorsOffsets[cursor] = --p;
    } else {
      newRotorsOffsets[cursor] = p = MAX_LETTER_INDEX;
    }

    if (!notchesMap[cursor][p + 1]) {
      break;
    }

    cursor++;
  } while (cursor < maxRotorIndex);

  return newRotorsOffsets;
}
