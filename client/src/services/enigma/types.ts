export interface DiskDefinition<T extends string = string> {
  id?: number | string;
  series: T;
  name: string;
  letters: string;
  thin?: boolean;
}

export type RotorTypes = "army" | "m3" | "m4" | "swiss" | "railway" | "commercial";
export type ReflectorTypes = "common" | "m4" | "swiss" | "railway";
export type EnigmaType = "army" | "m3" | "m4" | "swiss" | "railway" | "commercial" | "custom";

export interface RotorDefinition<T extends RotorTypes = RotorTypes> extends DiskDefinition<T> {
  setting: number;
  notches: number | number[];
}

export interface ReflectorDefinition<T extends ReflectorTypes = ReflectorTypes>
  extends DiskDefinition<T> {}

export type RotorIndex = number;
export type LetterIndex = number;
export type Step = {
  rotorIndex: RotorIndex;
  plaintextIndex: LetterIndex;
  cyphertextIndex: LetterIndex;
};
export type CurrentOutlets = { input: LetterIndex; output: LetterIndex };
export type Path = Step[];
/* Map a letter index to another letter index */
export type LetterIndexMap = Record<RotorIndex, LetterIndex>;
export type NotchMap = Record<LetterIndex, boolean>;
export type DictionaryEntry = [LetterIndexMap, RotorIndex];
export type Dictionary = DictionaryEntry[];

export type EncodingCache = {
  // offset: number[];
  rotorsCount: 3 | 4;
  notchesMap: NotchMap[];
  rotorsDict: {
    forwards: [LetterIndexMap, RotorIndex][];
    backwards: [LetterIndexMap, RotorIndex][];
  };
  reflectorDict: LetterIndexMap;
};
