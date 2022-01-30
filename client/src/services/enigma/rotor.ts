import { ALPHABET } from "./const";
import {
  DiskDefinition,
  LetterMap,
  ReflectorDefinition,
  ReflectorTypes,
  RotorDefinition,
  RotorTypes,
} from "./types";

abstract class Disk implements DiskDefinition {
  id: number | string;
  series: string;
  name: string;
  letters: string;
  thin: boolean;

  constructor(options: DiskDefinition) {
    const { series, name, letters, thin } = Object.assign(options, { thin: false });

    this.id = options.id || Date.now();
    this.series = series;
    this.name = name;
    this.letters = letters;
    this.thin = thin;
  }

  get letterList() {
    return this.letters.split("");
  }

  getForwardsLetterMap(): LetterMap {
    let rotorMap: LetterMap = {};

    this.letterList.forEach((letter, index) => {
      rotorMap[index] = ALPHABET.indexOf(letter);
    });

    return rotorMap;
  }

  getBackwardsLetterMap(): LetterMap {
    let rotorMap: LetterMap = {};

    this.letterList.forEach((letter, index) => {
      rotorMap[ALPHABET.indexOf(letter)] = index;
    });

    return rotorMap;
  }
}

export class Rotor extends Disk implements RotorDefinition {
  // @ts-ignore
  series: RotorTypes;
  setting: number;
  notches: number[];

  constructor(options: RotorDefinition) {
    super(options);
    const { setting, notches } = Object.assign(options);

    this.setting = setting;
    this.notches = Array.isArray(notches) ? notches : [notches];
  }

  static fromDefinition(options: RotorDefinition) {
    return new Rotor(options);
  }

  toDefinition(): RotorDefinition {
    return { ...this };
  }
}

export class Reflector extends Disk implements ReflectorDefinition {
  // @ts-ignore
  series: ReflectorTypes;
  static fromDefinition(options: ReflectorDefinition) {
    return new Reflector(options);
  }

  toDefinition(): ReflectorDefinition {
    return { ...this };
  }
}

type Index<T extends DiskDefinition[]> = {
  [Series in T[number] as T[number]["series"]]: {
    [Name in T[number] as T[number]["name"]]: T[number];
  };
};

function buildIndex<T extends DiskDefinition>(list: T[]) {
  const index: Record<string, Record<string, T>> = {};

  list.forEach((def) => {
    if (!(def.series in index)) {
      index[def.series] = {};
    }

    index[def.series][def.name] = def;
  });

  return index;
}

export const rotors: RotorDefinition<RotorTypes>[] = [
  {
    id: 1,
    series: "army",
    name: "I",
    letters: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
    setting: 0,
    notches: 17,
  },
  {
    id: 2,
    series: "army",
    name: "II",
    letters: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
    setting: 0,
    notches: 5,
  },
  {
    id: 3,
    series: "army",
    name: "III",
    letters: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
    setting: 0,
    notches: 22,
  },
  {
    id: 4,
    series: "army",
    name: "IV",
    letters: "ESOVPZJAYQUIRHXLNFTGKDCMWB",
    setting: 0,
    notches: 10,
  },
  {
    id: 5,
    series: "army",
    name: "V",
    letters: "VZBRGITYUPSDNHLXAWMJQOFECK",
    setting: 0,
    notches: 0,
  },
  {
    id: 6,
    series: "m3",
    name: "VI",
    letters: "JPGVOUMFYQBENHZRDKASXLICTW",
    setting: 0,
    notches: [0, 13],
  },
  {
    id: 7,
    series: "m3",
    name: "VII",
    letters: "NZJHGRCXMYSWBOUFAIVLPEKQDT",
    setting: 0,
    notches: [0, 13],
  },
  {
    id: 8,
    series: "m3",
    name: "VIII",
    letters: "FKQHTLXOCBJSPDZRAMEWNIUYGV",
    setting: 0,
    notches: [0, 13],
  },
  {
    id: 9,
    series: "m4",
    name: "BETA",
    letters: "LEYJVCNIXWPBQMDRTAKZGFUHOS",
    setting: 0,
    notches: 0,
    thin: true,
  },
  {
    id: 10,
    series: "m4",
    name: "GAMMA",
    letters: "FSOKANUERHMBTIYCWLQPZXVGJD",
    setting: 0,
    notches: 0,
    thin: true,
  },
  //--> Notches not confirmed
  {
    id: 11,
    series: "commercial",
    name: "I",
    letters: "DMTWSILRUYQNKFEJCAZBPGXOHV",
    setting: 0,
    notches: 17,
  },
  {
    id: 12,
    series: "commercial",
    name: "II",
    letters: "HQZGPJTMOBLNCIFDYAWVEUSRKX",
    setting: 0,
    notches: 5,
  },
  {
    id: 13,
    series: "commercial",
    name: "III",
    letters: "UQNTLSZFMREHDPXKIBVYGJCWOA",
    setting: 0,
    notches: 22,
  },
  {
    id: 14,
    series: "swiss",
    name: "I",
    letters: "PEZUOHXSCVFMTBGLRINQJWAYDK",
    setting: 0,
    notches: 17,
  },
  {
    id: 15,
    series: "swiss",
    name: "II",
    letters: "ZOUESYDKFWPCIQXHMVBLGNJRAT",
    setting: 0,
    notches: 5,
  },
  {
    id: 16,
    series: "swiss",
    name: "III",
    letters: "EHRVXGAOBQUSIMZFLYNWKTPDJC",
    setting: 0,
    notches: 22,
  },
  {
    id: 17,
    series: "swiss",
    name: "ETW",
    letters: "QWERTZUIOASDFGHJKPYXCVBNML",
    setting: 0,
    notches: 0,
  },
  {
    id: 18,
    series: "railway",
    name: "I",
    letters: "JGDQOXUSCAMIFRVTPNEWKBLZYH",
    setting: 0,
    notches: 17,
  },
  {
    id: 19,
    series: "railway",
    name: "II",
    letters: "NTZPSFBOKMWRCJDIVLAEYUXHGQ",
    setting: 0,
    notches: 5,
  },
  {
    id: 20,
    series: "railway",
    name: "III",
    letters: "JVIUBHTCDYAKEQZPOSGXNRMWFL",
    setting: 0,
    notches: 22,
  },
  {
    id: 21,
    series: "railway",
    name: "ETW",
    letters: "QWERTZUIOASDFGHJKPYXCVBNML",
    setting: 0,
    notches: 0,
  },
  //<-- Notches not confirmed
];

export const reflectors: ReflectorDefinition<ReflectorTypes>[] = [
  { id: 1, series: "common", name: "A", letters: "EJMZALYXVBWFCRQUONTSPIKHGD" },
  { id: 2, series: "common", name: "B", letters: "YRUHQSLDPXNGOKMIEBFZCWVJAT" },
  { id: 3, series: "common", name: "C", letters: "FVPJIAOYEDRZXWGCTKUQSBNMHL" },
  { id: 4, series: "m4", name: "B-thin", letters: "ENKQAUYWJICOPBLMDXZVFTHRGS", thin: true },
  { id: 5, series: "m4", name: "C-thin", letters: "RDOBJNTKVEHMLFCWZAXGYIPSUQ", thin: true },
  { id: 6, series: "swiss", name: "UKW", letters: "IMETCGFRAYSQBZXWLHKDVUPOJN" },
  { id: 7, series: "railway", name: "UKW", letters: "QYHOGNECVPUZTFDJAXWMKISRBL" },
];

export const rotorsIndex: Index<typeof rotors> = buildIndex(rotors) as Index<typeof rotors>;
export const reflectorsIndex: Index<typeof reflectors> = buildIndex(reflectors) as Index<
  typeof reflectors
>;
