import { didactState } from "./core";

function useState(initial: any) {

    const oldHook =
      didactState.wipFiber.alternate &&
      didactState.wipFiber.alternate.hooks &&
      didactState.wipFiber.alternate.hooks[didactState.hookIndex]
    
    const hook: xxx = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    }
    
    const actions = oldHook ? oldHook.queue : []
    actions.forEach((action: any) => {
      hook.state = action(hook.state)
    })
  
    const setState = (action: any) => {
      hook.queue.push(action)
      didactState.wipRoot = {
        dom: didactState.currentRoot.dom,
        props: didactState.currentRoot.props,
        alternate: didactState.currentRoot,
      }
      didactState.nextUnitOfWork = didactState.wipRoot
      didactState.deletions = []
    }
  
    if (didactState.wipFiber && didactState.wipFiber.hooks) {
        didactState.wipFiber.hooks.push(hook);
        didactState.hookIndex++
    }
    
    return [hook.state, setState]
  }
  