
export type PegIndex = 0 | 1 | 2;
export type HanoiState = PegIndex[]; 

export interface TreeNode {
  id: string;
  state: HanoiState;
  stateStr: string;
  parentId: string | null;
  children: TreeNode[];
  isPath: boolean;
  depth: number;
  order: number; 
  numDisks: number;
  g?: number; 
  h?: number; 
  f?: number; 
}

export type AlgorithmType = 'BFS' | 'DFS' | 'Best-First' | 'A-Star';
