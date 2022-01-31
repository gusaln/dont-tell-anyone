import { useEffect } from "react";
import { Observable, Observer } from "rxjs";

export default function useTapStream<T>(stream$: Observable<T>, cb: Partial<Observer<T>>) {
  useEffect(() => {
    const subscription = stream$.subscribe(cb);

    return () => subscription.unsubscribe();
  }, [cb]);
}
