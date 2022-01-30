export type OldStep = [number, number, number];
export type Step = { rotorIndex: number; plaintextIndex: number; encodedIndex: number };
export type Path = OldStep[];
export type LetterIndex = number;
export type LetterMap = Record<number, number>;
export type DictionaryEntry = [LetterMap, number];
export type Dictionary = DictionaryEntry[];

export type NotchMap = Record<number, boolean>;

export type EncodingCache = {
  // offset: number[];
  rotorsCount: 3 | 4;
  notchesMap: NotchMap[];
  rotorsDict: {
    forwards: [LetterMap, number][];
    backwards: [LetterMap, number][];
  };
  reflectorDict: LetterMap;
};

export interface DiskDefinition<T extends string = string> {
  id?: number | string;
  series: T;
  name: string;
  letters: string;
  thin?: boolean;
}

export type RotorTypes = "army" | "m3" | "m4" | "swiss" | "railway" | "commercial";
export type ReflectorTypes = "common" | "m4" | "swiss" | "railway";

export interface RotorDefinition<T extends RotorTypes = RotorTypes> extends DiskDefinition<T> {
  setting: number;
  notches: number | number[];
}

export interface ReflectorDefinition<T extends ReflectorTypes = ReflectorTypes>
  extends DiskDefinition<T> {}
