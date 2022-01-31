import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export default function useStream<T, K = T>(
  stream$: Observable<T>,
  initialValue: K | (() => K)
): T | K {
  const [state, setState] = useState<T | K>(initialValue);

  useEffect(() => {
    const subscription = stream$.subscribe(setState);

    return () => subscription.unsubscribe();
  }, [stream$]);

  return state;
}
