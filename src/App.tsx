import React, { useState, useMemo } from 'react';
import { AlgorithmType } from './types';
import { solveHanoi } from './algorithms';
import TreeVisualization from './components/TreeVisualization';
import { Play, Info, Layers, GitBranch, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('BFS');
  const [numDisks, setNumDisks] = useState<number>(3);
  
  const { tree, solution } = useMemo(() => solveHanoi(algorithm, numDisks), [algorithm, numDisks]);

  const algorithms: { type: AlgorithmType; name: string; icon: React.ReactNode }[] = [
    { type: 'BFS', name: '너비 우선 탐색 (BFS)', icon: <Layers className="w-4 h-4" /> },
    { type: 'DFS', name: '깊이 우선 탐색 (DFS)', icon: <GitBranch className="w-4 h-4" /> },
    { type: 'Best-First', name: '최상 우선 탐색', icon: <Zap className="w-4 h-4" /> },
    { type: 'A-Star', name: 'A* 알고리즘', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-bottom border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
              하노이의 탑 상태 공간 트리 시각화
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              탐색 알고리즘 비교 및 시각화 도구 by 11532 최민성
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
            {algorithms.map((algo) => (
              <button
                key={algo.type}
                onClick={() => setAlgorithm(algo.type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  algorithm === algo.type
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {algo.icon}
                {algo.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              알고리즘 정보
            </h2>
            <div className="text-lg font-bold text-slate-800 mb-4">
              {algorithms.find(a => a.type === algorithm)?.name}
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              {algorithm === 'Best-First' && (
                <div className="space-y-2">
                  <p>목표까지 얼마나 남았는지(h)만 보고 가장 가까운 곳을 먼저 가요.</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="font-bold text-slate-800 mb-1">계산 기준 (h)</div>
                    <p className="text-xs">목표 기둥(C)에 있지 않은 원반들을 점수로 환산해요. 점수가 낮을수록 목표에 가까운 상태예요!</p>
                  </div>
                </div>
              )}
              {algorithm === 'A-Star' && (
                <div className="space-y-2">
                  <p>지금까지 온 길(g)과 앞으로 갈 길(h)을 모두 합쳐서(f) 가장 짧을 것 같은 길을 찾아요.</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">g (지금까지 온 길)</div>
                      <p className="text-[11px]">시작점에서 현재까지 몇 번 움직였는지 나타내요.</p>
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">h (앞으로 갈 길)</div>
                      <p className="text-[11px]">목표까지 대략 몇 번 더 움직여야 할지 예상한 값이에요.</p>
                    </div>
                    <div className="pt-1 border-top border-slate-200">
                      <div className="font-bold text-blue-600 text-xs">f = g + h (전체 점수)</div>
                      <p className="text-[11px]">이 점수가 가장 낮은 길을 따라가면 가장 빨리 도착할 수 있어요!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">원반 개수 설정</h2>
            <div className="flex items-center gap-4">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumDisks(n)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    numDisks === n
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">탐색 결과</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">탐색된 노드 수</span>
                <span className="font-mono font-bold text-blue-600">{countNodes(tree)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">최적 경로 길이</span>
                <span className="font-mono font-bold text-emerald-600">{solution.length - 1}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Visualization Area */}
        <div className="lg:col-span-3 h-full flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <TreeVisualization data={tree} algorithm={algorithm} />
          </div>
        </div>
      </main>
    </div>
  );
}

function countNodes(node: any): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}
