
import { HanoiState, PegIndex, TreeNode, AlgorithmType } from './types';

export function stateToString(state: HanoiState, numDisks: number): string {
  const pegs: number[][] = [[], [], []];
  for (let i = numDisks - 1; i >= 0; i--) {
    pegs[state[i]].push(i + 1);
  }
  return `A:[${pegs[0].join(',')}], B:[${pegs[1].join(',')}], C:[${pegs[2].join(',')}]`;
}

export function getValidMoves(state: HanoiState, numDisks: number): HanoiState[] {
  const moves: HanoiState[] = [];
  const topDisks: (number | null)[] = [null, null, null];

  for (let i = 0; i < numDisks; i++) {
    const peg = state[i];
    if (topDisks[peg] === null) {
      topDisks[peg] = i;
    }
  }

  for (let fromPeg = 0; fromPeg < 3; fromPeg++) {
    const diskToMove = topDisks[fromPeg];
    if (diskToMove === null) continue;

    for (let toPeg = 0; toPeg < 3; toPeg++) {
      if (fromPeg === toPeg) continue;

      const targetTopDisk = topDisks[toPeg];
      if (targetTopDisk === null || diskToMove < targetTopDisk) {
        const newState = [...state];
        newState[diskToMove] = toPeg as PegIndex;
        moves.push(newState);
      }
    }
  }

  return moves;
}

function getHeuristic(state: HanoiState, numDisks: number): number {
  let h = 0;
  for (let i = 0; i < numDisks; i++) {
    if (state[i] !== 2) {
      h += Math.pow(2, i);
    }
  }
  return h;
}

export function solveHanoi(algorithm: AlgorithmType, numDisks: number): { tree: TreeNode; solution: string[] } {
  const initialState: HanoiState = new Array(numDisks).fill(0);
  const goalStateStr = `A:[], B:[], C:[${Array.from({ length: numDisks }, (_, i) => numDisks - i).join(',')}]`;
  
  const root: TreeNode = {
    id: '1',
    state: initialState,
    stateStr: stateToString(initialState, numDisks),
    parentId: null,
    children: [],
    isPath: false,
    depth: 0,
    order: 1,
    numDisks,
  };

  const idToNode = new Map<string, TreeNode>();
  idToNode.set(root.id, root);

  const visited = new Map<string, TreeNode>();
  visited.set(root.stateStr, root);

  let orderCounter = 2;
  let goalNode: TreeNode | null = null;

  if (algorithm === 'BFS') {
    const queue: TreeNode[] = [root];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.stateStr === goalStateStr) {
        goalNode = current;
        break;
      }

      const nextStates = getValidMoves(current.state, numDisks);
      for (const nextState of nextStates) {
        const sStr = stateToString(nextState, numDisks);
        if (!visited.has(sStr)) {
          const currentOrder = orderCounter++;
          const newNode: TreeNode = {
            id: String(currentOrder),
            state: nextState,
            stateStr: sStr,
            parentId: current.id,
            children: [],
            isPath: false,
            depth: current.depth + 1,
            order: currentOrder,
            numDisks,
          };
          current.children.push(newNode);
          visited.set(sStr, newNode);
          idToNode.set(newNode.id, newNode);
          queue.push(newNode);
        }
      }
    }
  } else if (algorithm === 'DFS') {
    const visited = new Set<string>();
    
    const runDFS = (node: TreeNode): boolean => {
      visited.add(node.stateStr);
      
      if (node.stateStr === goalStateStr) {
        goalNode = node;
        return true;
      }

      // Limit search to prevent massive trees in visualization
      if (orderCounter > 500) return false;

      const nextStates = getValidMoves(node.state, numDisks);
      
      // Add all unvisited neighbors to the tree as children first
      // This ensures branches are visible even if we only recurse into one
      const childrenToExplore: TreeNode[] = [];
      for (const nextState of nextStates) {
        const sStr = stateToString(nextState, numDisks);
        if (!visited.has(sStr)) {
          const currentOrder = orderCounter++;
          const newNode: TreeNode = {
            id: String(currentOrder),
            state: nextState,
            stateStr: sStr,
            parentId: node.id,
            children: [],
            isPath: false,
            depth: node.depth + 1,
            order: currentOrder,
            numDisks,
          };
          node.children.push(newNode);
          idToNode.set(newNode.id, newNode);
          childrenToExplore.push(newNode);
        }
      }

      // Now recurse into the children
      for (const child of childrenToExplore) {
        if (runDFS(child)) return true;
      }
      
      return false;
    };
    runDFS(root);
  } else if (algorithm === 'Best-First') {
    root.h = getHeuristic(root.state, numDisks);
    const pq = [root];
    while (pq.length > 0) {
      pq.sort((a, b) => (a.h || 0) - (b.h || 0));
      const current = pq.shift()!;
      if (current.stateStr === goalStateStr) {
        goalNode = current;
        break;
      }
      const nextStates = getValidMoves(current.state, numDisks);
      for (const nextState of nextStates) {
        const sStr = stateToString(nextState, numDisks);
        if (!visited.has(sStr)) {
          const currentOrder = orderCounter++;
          const newNode: TreeNode = {
            id: String(currentOrder),
            state: nextState,
            stateStr: sStr,
            parentId: current.id,
            children: [],
            isPath: false,
            depth: current.depth + 1,
            order: currentOrder,
            h: getHeuristic(nextState, numDisks),
            numDisks,
          };
          current.children.push(newNode);
          visited.set(sStr, newNode);
          idToNode.set(newNode.id, newNode);
          pq.push(newNode);
        }
      }
    }
  } else if (algorithm === 'A-Star') {
    root.g = 0;
    root.h = getHeuristic(root.state, numDisks);
    root.f = root.g + root.h;
    const pq = [root];
    while (pq.length > 0) {
      pq.sort((a, b) => (a.f || 0) - (b.f || 0));
      const current = pq.shift()!;
      if (current.stateStr === goalStateStr) {
        goalNode = current;
        break;
      }
      const nextStates = getValidMoves(current.state, numDisks);
      for (const nextState of nextStates) {
        const sStr = stateToString(nextState, numDisks);
        const g = current.depth + 1;
        const h = getHeuristic(nextState, numDisks);
        const f = g + h;
        if (!visited.has(sStr)) {
          const currentOrder = orderCounter++;
          const newNode: TreeNode = {
            id: String(currentOrder),
            state: nextState,
            stateStr: sStr,
            parentId: current.id,
            children: [],
            isPath: false,
            depth: g,
            order: currentOrder,
            g, h, f,
            numDisks,
          };
          current.children.push(newNode);
          visited.set(sStr, newNode);
          idToNode.set(newNode.id, newNode);
          pq.push(newNode);
        }
      }
    }
  }

  const solution: string[] = [];
  let curr = goalNode;
  while (curr) {
    curr.isPath = true;
    solution.unshift(curr.stateStr);
    if (curr.parentId === null) break;
    curr = idToNode.get(curr.parentId) || null;
  }

  return { tree: root, solution };
}
