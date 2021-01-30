import { Fiber } from "./Fiber"

interface IDidactState {
    // Keep track of the work-in-progress root and only 
    // add it to DOM once we've finished performing all the work
    // so that the user never sees the UI in an incomplete state.  
    wipRoot: Fiber;
    currentRoot: Fiber;
    // An array that keeps track of nodes we want to remove from the dom 
    // based on reconciliation results
    deletions: Fiber[];
    wipFiber: Fiber;
    nextUnitOfWork: Fiber;
    hookIndex: number;
}
  
export const DidactState = {} as IDidactState;