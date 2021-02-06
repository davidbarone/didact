import { DidactState } from "./DidactState";
import { isEqual } from "lodash";

export function useEffect(callback: () => void, deps: any[]) {
    const oldHook =
        DidactState.wipFiber.alternate &&
        DidactState.wipFiber.alternate.hooks &&
        DidactState.wipFiber.alternate.hooks[DidactState.hookIndex];

    const hook = {
        deps
    };

    if (!oldHook) {
        // invoke callback if this is the first time
        callback();
    } else {
        if (!isEqual(oldHook.deps, hook.deps)) {
            callback();
        }
    }

    if (DidactState.wipFiber.hooks) {
        DidactState.wipFiber.hooks.push(hook);
        DidactState.hookIndex++;
    }
}