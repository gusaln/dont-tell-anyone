import React, { createContext, useContext, useRef } from "react";
import {
  BehaviorSubject,
  combineLatest,
  connectable,
  debounceTime,
  filter,
  map,
  mapTo,
  mergeWith,
  Observable,
  scan,
  Subject,
} from "rxjs";
import {
  ALPHABET,
  Dictionary,
  encode,
  EncodingCache,
  EnigmaType,
  isInAlphabet,
  NotchMap,
  ReflectorDefinition,
  rotateBackwards,
  rotateForwards,
  RotorDefinition,
  RotorTypes,
  Step,
} from "../services/enigma";
import { Reflector, reflectorsIndex, Rotor, rotorsIndex } from "../services/enigma/rotor";

type OffsetChange = { rotorIndex: 1 | 2 | 3 | 4; offset: number };

type Action =
  | { type: "input"; char: string }
  | { type: "invalidInput"; char?: string }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "rotorChange" }
  | { type: "reflectorChange" }
  | ({ type: "offsetChange" } & OffsetChange);

type MachineState = {
  plaintext: string;
  cyphertext: string;
  offsets: number[];
  path: Step[];
};

type Rotors = Rotor[];

class EnigmaService {
  private keyboardInputEvent$ = new Subject<KeyboardEvent>();
  private offsetChange$ = new Subject<OffsetChange>();
  private clearEvent$ = new Subject<void>();

  private rotorsSubject$!: BehaviorSubject<Rotors>;
  private reflectorSubject$!: BehaviorSubject<Reflector>;

  private currentRotors!: Rotors;
  private currentReflector!: Reflector;

  public rotors$!: Observable<Rotors>;
  public reflector$!: Observable<Reflector>;
  public type$!: Observable<EnigmaType>;
  public action$!: Observable<Action>;
  public machineState$!: Observable<MachineState>;
  public lastPlaintextLetter$!: Observable<string | undefined>;
  public lastCyphertextLetter$!: Observable<string | undefined>;

  constructor() {
    this.wireStreamsUp();
  }

  private wireStreamsUp() {
    this.currentRotors = [rotorsIndex.army.III, rotorsIndex.army.II, rotorsIndex.army.I].map((r) =>
      Rotor.fromDefinition(r)
    ) as Rotors;
    this.currentReflector = Reflector.fromDefinition(reflectorsIndex.common.A);

    this.rotorsSubject$ = new BehaviorSubject<Rotors>(this.currentRotors);
    this.reflectorSubject$ = new BehaviorSubject<Reflector>(this.currentReflector);

    this.rotors$ = this.rotorsSubject$.asObservable();
    this.reflector$ = this.reflectorSubject$.asObservable();
    this.type$ = this.rotors$.pipe(
      map((rotors) => {
        const series = rotors
          .map((r) => r.series as RotorTypes)
          .reduce((prev, curr) => {
            if (prev.has(curr)) return prev;
            prev.add(curr);
            return prev;
          }, new Set<RotorTypes>());

        if (series.size > 1) {
          return "custom";
        }

        return series.values()[0] as EnigmaType;
      })
    );

    const notchesMap$: Observable<NotchMap[]> = this.rotors$.pipe(
      map((rotors) =>
        rotors.map((rotor) => Object.fromEntries(rotor.notches.map((notch) => [notch, true])))
      )
    );
    const rotorsDictionaries$ = this.rotors$.pipe(
      map((rotors) => {
        const rotorEntries: [Rotor, number][] = rotors.map((rotor, i) => [rotor, i]);

        return {
          forwards: rotorEntries.map(([rotor, i]) => [
            rotor.getForwardsLetterMap(),
            i,
          ]) as Dictionary,
          backwards: rotorEntries
            .reverse()
            .map(([rotor, i]) => [rotor.getBackwardsLetterMap(), i]) as Dictionary,
        };
      })
    );
    const reflectorDictionaries$ = this.reflector$.pipe(
      map((reflector) => reflector.getForwardsLetterMap())
    );

    const encodingCache$: Observable<EncodingCache> = combineLatest([
      notchesMap$,
      rotorsDictionaries$,
      reflectorDictionaries$,
    ]).pipe(
      map(([notchesMap, rotorsDict, reflectorDict]) => ({
        rotorsCount: rotorsDict.forwards.length as 3 | 4,
        notchesMap,
        rotorsDict,
        reflectorDict,
      }))
      // tap((encoding) => {
      //   console.log("encoding", { encoding });
      // })
    );

    this.action$ = this.keyboardInputEvent$.pipe(
      filter((ev) => !(ev.ctrlKey || ev.shiftKey || ev.altKey)),
      map((ev): Action => {
        if (ev.key === "Backspace") {
          return { type: "backspace" };
        }

        if (ALPHABET.indexOf(ev.key.toUpperCase()) < 0) {
          return { type: "invalidInput", char: ev.key };
        }

        return { type: "input", char: ev.key.toUpperCase() };
      }),
      mergeWith(
        this.rotors$.pipe(mapTo({ type: "rotorChange" } as Action)),
        this.reflector$.pipe(mapTo({ type: "reflectorChange" } as Action)),
        this.offsetChange$.pipe(map((change) => ({ ...change, type: "offsetChange" } as Action))),
        this.clearEvent$.pipe(mapTo({ type: "clear" } as Action))
      )
      // startWith({ type: "clear" } as Action)
    );

    const machineStateSubject$ = connectable(
      combineLatest([encodingCache$, this.action$]).pipe(
        scan((state, [encoderState, action]): MachineState => {
          if (
            (["clear", "rotorChange", "reflectorChange"] as Action["type"][]).includes(action.type)
          ) {
            return this.makeNewMachineState(encoderState.rotorsDict.forwards.map(() => 0));
          }

          if (action.type == "offsetChange") {
            const offsets = state.offsets.slice();
            offsets[action.rotorIndex] = action.offset;

            return this.makeNewMachineState(offsets);
          }

          if (action.type == "backspace") {
            if (state.plaintext.length == 0) {
              return state;
            }

            const offsets = rotateBackwards(
              state.offsets,
              encoderState.notchesMap,
              state.offsets.length
            );
            const plaintext = state.plaintext.slice(0, -1);
            const cyphertext = state.cyphertext.slice(0, -1);

            if (plaintext.length == 0) {
              return { plaintext, cyphertext, offsets, path: [] };
            }

            const [_, path] = encode(encoderState, offsets, plaintext.at(-1) as string);

            return { plaintext, cyphertext, offsets, path };
          }

          if (action.type == "input") {
            const offsets = rotateForwards(
              state.offsets,
              encoderState.notchesMap,
              state.offsets.length
            );
            const [cyphertext, path] = encode(encoderState, offsets, action.char);

            return {
              plaintext: state.plaintext + action.char,
              cyphertext: state.cyphertext + cyphertext,
              offsets,
              path,
            };
          }

          if (action.type == "invalidInput") {
            return {
              plaintext: state.plaintext + action.char,
              cyphertext: state.cyphertext + action.char,
              offsets: state.offsets,
              path: state.path,
            };
          }

          return state;
        }, this.makeNewMachineState(this.currentRotors.map(() => 0))),
        debounceTime(1000 / 60)
      ),
      {
        connector: () =>
          new BehaviorSubject<MachineState>(
            this.makeNewMachineState(this.currentRotors.map(() => 0))
          ),
      }
    );

    this.lastPlaintextLetter$ = machineStateSubject$.pipe(
      map((state) => state.plaintext.split("").filter(isInAlphabet).at(-1))
    );
    this.lastCyphertextLetter$ = machineStateSubject$.pipe(
      map((state) => state.cyphertext.split("").filter(isInAlphabet).at(-1))
    );

    this.rotors$.subscribe((rotors) => (this.currentRotors = rotors.slice()));
    this.reflector$.subscribe((reflector) => (this.currentReflector = reflector));

    this.machineState$ = machineStateSubject$;

    machineStateSubject$.connect();
  }

  async handleInputKeyboardEvent(ev: KeyboardEvent) {
    this.keyboardInputEvent$.next(ev);
  }

  clearPlaintext() {
    this.clearEvent$.next();
  }

  async changeRotor(rotorIndex: number, rotor: RotorDefinition) {
    const newRotors = this.currentRotors.slice();
    newRotors[rotorIndex] = Rotor.fromDefinition(rotor);
    this.rotorsSubject$.next(newRotors);
  }

  async changeReflector(reflector: ReflectorDefinition) {
    this.reflectorSubject$.next(Reflector.fromDefinition(reflector));
  }

  async changeOffset(rotorIndex: 1 | 2 | 3 | 4, offset: number) {
    this.offsetChange$.next({ rotorIndex, offset });
  }

  private makeNewMachineState(offsets: number[]): MachineState {
    return {
      plaintext: "",
      cyphertext: "",
      offsets: offsets.slice(),
      path: [],
    };
  }
}

function useEnigmaController() {
  const enigmaService = useRef(new EnigmaService());

  return { enigmaService };
}

const EnigmaContext = createContext<ReturnType<typeof useEnigmaController>>({} as any);

export default function useEnigmaContext() {
  return useContext(EnigmaContext);
}

interface ProvideEnigmaContextProps {
  [x: string]: any;
}

export function ProvideEnigmaContext({ children }: ProvideEnigmaContextProps) {
  const enigmaController = useEnigmaController();

  return <EnigmaContext.Provider value={enigmaController}>{children}</EnigmaContext.Provider>;
}
