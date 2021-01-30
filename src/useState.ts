import { DidactState } from "./DidactState";

export function useState<T>(initial: T): [T, (action: (prevState: T) => T) => void] {
  const oldHook =
    DidactState.wipFiber.alternate &&
    DidactState.wipFiber.alternate.hooks &&
    DidactState.wipFiber.alternate.hooks[DidactState.hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [] as any[],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach((action: any) => {
    hook.state = action(hook.state)
  })

  const setState = (action: any) => {
    hook.queue.push(action)
    DidactState.wipRoot = {
      dom: DidactState.currentRoot.dom,
      props: DidactState.currentRoot.props,
      alternate: DidactState.currentRoot,
    }
    DidactState.nextUnitOfWork = DidactState.wipRoot
    DidactState.deletions = []
  }

  if (DidactState.wipFiber && DidactState.wipFiber.hooks) {
    DidactState.wipFiber.hooks.push(hook)
    DidactState.hookIndex++
  }
  return [hook.state, setState]
}
