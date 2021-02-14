import { useMemo } from "./useMemo";

export function useCallback<T>(callback: T, deps: any[]): T {
    return useMemo(() => callback, deps);
}