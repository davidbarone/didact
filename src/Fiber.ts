import { FiberType } from "./FiberType"
import { FiberEffectTag } from "./FiberEffectTag"
import { DomNode } from "./DomNode"

export interface Fiber {
    props: any,
    alternate?: Fiber,
    dom?: DomNode,
    type?: FiberType | Function,
    effectTag?: FiberEffectTag,
    parent?: Fiber,
    child?: Fiber,
    sibling?: Fiber,
    hooks?: any[]
}