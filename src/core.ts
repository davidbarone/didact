import { FiberType } from "./FiberType"
import { FiberEffectTag } from "./FiberEffectTag"
import { DomNode } from "./DomNode"
import { Fiber } from "./Fiber"
import { DidactState } from "./DidactState"
import { isEvent, isGone, isNew, isProperty } from "./Helper"
import { RequestIdleCallbackDeadline } from "./Global"

function createElement(type:string, props:any, ...children:any[]) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}

function createTextElement(text:string) {
  return {
    type: FiberType.TextElement,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createDom(fiber: Fiber): DomNode {
  const dom =
    fiber.type == FiberType.TextElement
      ? document.createTextNode("")
      : document.createElement(fiber.type as unknown as FiberType)

  updateDom(dom, {}, fiber.props)
  return dom
}

function updateDom(dom: DomNode, prevProps: any, nextProps: any) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name:  string) => {
      (dom as any)[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      (dom as any)[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

function commitRoot() {
  DidactState.deletions.forEach(commitWork)
  if (DidactState.wipRoot && DidactState.wipRoot.child) {
    commitWork(DidactState.wipRoot.child)
    DidactState.currentRoot = DidactState.wipRoot
  }
  DidactState.wipRoot = null
}

function commitWork(fiber: Fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber: Fiber, domParent: DomNode) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

function render(element: any, container: DomNode) {
  DidactState.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: DidactState.currentRoot
  }
  DidactState.deletions = []
  DidactState.nextUnitOfWork = DidactState.wipRoot
}

function workLoop(deadline: RequestIdleCallbackDeadline) {
  let shouldYield = false
  while (DidactState.nextUnitOfWork && !shouldYield) {
    DidactState.nextUnitOfWork = performUnitOfWork(DidactState.nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!DidactState.nextUnitOfWork && DidactState.wipRoot) {
    commitRoot()
  }

  window.requestIdleCallback(workLoop)
}

window.requestIdleCallback(workLoop)

function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent =
    fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function updateFunctionComponent(fiber: Fiber) {
  DidactState.wipFiber = fiber
  DidactState.hookIndex = 0
  DidactState.wipFiber.hooks = []
  const children = [(fiber.type as Function)(fiber.props)]
  reconcileChildren(fiber, children)
}

function useState(initial) {
  const oldHook =
    DidactState.wipFiber.alternate &&
    DidactState.wipFiber.alternate.hooks &&
    DidactState.wipFiber.alternate.hooks[DidactState.hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: DidactState.currentRoot.dom,
      props: DidactState.currentRoot.props,
      alternate: DidactState.currentRoot,
    }
    DidactState.nextUnitOfWork = DidactState.wipRoot
    DidactState.deletions = []
  }

  DidactState.wipFiber.hooks.push(hook)
  DidactState.hookIndex++
  return [hook.state, setState]
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(wipFiber: Fiber, elements: any) {
  let index = 0
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null

    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = FiberEffectTag.Deletion
      DidactState.deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

const Didact = {
  createElement,
  render,
  useState,
}
