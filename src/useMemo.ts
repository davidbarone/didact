import { DidactState } from "./DidactState";
import { isEqual } from "lodash";

export function useMemo<T>(compute: () => T, deps: any[]): T {
    const oldHook =
        DidactState.wipFiber.alternate &&
        DidactState.wipFiber.alternate.hooks &&
        DidactState.wipFiber.alternate.hooks[DidactState.hookIndex];

    const hook = {
        value: null as any,
        deps
    };

    if (oldHook) {
        if (isEqual(oldHook.deps, hook.deps)) {
            hook.value = oldHook.value;
        } else {
            hook.value = compute();
        }
    } else {
        hook.value = compute();
    }

    if (DidactState.wipFiber.hooks) {
        DidactState.wipFiber.hooks.push(hook);
        DidactState.hookIndex++;
    }

    return hook.value;
}