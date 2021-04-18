import { DidactState } from "./DidactState";

export function useRef<T>(initial: T): { current: T } {
    const oldHook =
        DidactState.wipFiber.alternate &&
        DidactState.wipFiber.alternate.hooks &&
        DidactState.wipFiber.alternate.hooks[DidactState.hookIndex];

    const hook = {
        value: oldHook ? oldHook.value : { current: initial }
    };

    if (DidactState.wipFiber.hooks) {
        DidactState.wipFiber.hooks.push(hook);
        DidactState.hookIndex++;
    }

    return hook.value;
}