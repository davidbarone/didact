import { FiberType } from "./FiberType"
import { FiberEffectTag } from "./FiberEffectTag"
import { DomNode } from "./DomNode"
import { Fiber } from "./Fiber"
import { DidactState } from "./DidactState"
import { isEvent, isGone, isNew, isProperty } from "./Helper"
import { RequestIdleCallbackDeadline } from "./Global"


// Provides ability to put a <Fragment> root
// node on JSX. Simply returns the children
// objects.
function Fragment(props: any) {
	return props.children;
}

function toChildArray(children:any, out:any[]) {
	out = out || [];
	if (children == null || typeof children == 'boolean') {
	} else if (Array.isArray(children)) {
		children.some(child => {
			toChildArray(child, out);
		});
	} else {
		out.push(children);
	}
	return out;
}

function createElement(type: string, props: any, ...children: any[]) {
  console.log(type);
  console.log(`type is ${type}`)
  children = toChildArray(children, []);
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
  DidactState.wipRoot = undefined
}

function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }

  let domParent: DomNode | undefined = undefined

  if (domParentFiber) {
    domParent = domParentFiber.dom
  }

  if (
    fiber.effectTag === FiberEffectTag.Placement &&
    fiber.dom != null &&
    domParent
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === FiberEffectTag.Update &&
    fiber.dom != null &&
    fiber.alternate
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === FiberEffectTag.Deletion && domParent) {
    commitDeletion(domParent, fiber)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(domParent: DomNode, fiber?: Fiber) {
  if (fiber && fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else if (fiber && fiber.child) {
    commitDeletion(domParent, fiber.child)
  }
}

function render(element: any, container: DomNode) {
  DidactState.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: DidactState.currentRoot,
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

function performUnitOfWork(fiber: Fiber): Fiber | undefined {
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
    nextFiber = nextFiber.parent as Fiber
  }
  return undefined
}

function updateFunctionComponent(fiber: Fiber) {
  DidactState.wipFiber = fiber
  DidactState.hookIndex = 0
  DidactState.wipFiber.hooks = []
  const children = [(fiber.type as Function)(fiber.props)]
  reconcileChildren(fiber, children)
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
  let prevSibling: Fiber | undefined = undefined

  while (
    index < elements.length || oldFiber != undefined
  ) {
    const element = elements[index]
    let newFiber: Fiber | undefined = undefined

    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber ? oldFiber.type : undefined,
        props: element.props,
        dom: oldFiber ? oldFiber.dom : undefined,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: FiberEffectTag.Update
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: wipFiber,
        alternate: undefined,
        effectTag: FiberEffectTag.Placement
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
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

export {
  createElement,
  render,
  Fragment
}