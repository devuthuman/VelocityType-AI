import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { HistoryItem, TestStats } from '../types';
import { Activity, Target, Zap, Clock } from 'lucide-react';

interface StatsProps {
  currentStats?: TestStats;
  history: HistoryItem[];
}

export const CurrentStatsDisplay: React.FC<{ stats: TestStats }> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-6">
    <div className="bg-dark-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center">
      <div className="text-gray-400 text-sm flex items-center gap-2 mb-1"><Zap size={14} /> WPM</div>
      <div className="text-4xl font-bold text-brand-500">{stats.wpm}</div>
    </div>
    <div className="bg-dark-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center">
      <div className="text-gray-400 text-sm flex items-center gap-2 mb-1"><Target size={14} /> Accuracy</div>
      <div className={`text-4xl font-bold ${stats.accuracy > 95 ? 'text-green-500' : stats.accuracy > 80 ? 'text-yellow-500' : 'text-red-500'}`}>
        {stats.accuracy}%
      </div>
    </div>
    <div className="bg-dark-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center">
      <div className="text-gray-400 text-sm flex items-center gap-2 mb-1"><Clock size={14} /> Time</div>
      <div className="text-4xl font-bold text-gray-200">{Math.floor(stats.timeElapsed)}s</div>
    </div>
    <div className="bg-dark-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center">
      <div className="text-gray-400 text-sm flex items-center gap-2 mb-1"><Activity size={14} /> Raw</div>
      <div className="text-4xl font-bold text-gray-500">{stats.rawWpm}</div>
    </div>
  </div>
);

export const HistoryCharts: React.FC<{ history: HistoryItem[] }> = ({ history }) => {
  if (history.length === 0) return null;

  // Prepare data for problem keys
  const allMissedKeys: Record<string, number> = {};
  history.forEach(h => {
    Object.entries(h.missedKeys).forEach(([key, count]) => {
      // Cast count to number to resolve 'unknown' type error
      allMissedKeys[key] = (allMissedKeys[key] || 0) + (count as number);
    });
  });

  const problemKeysData = Object.entries(allMissedKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10 worst keys
    .map(([key, count]) => ({ key, count }));

  // Prepare WPM history (last 20 tests)
  const chartData = history.slice(-20).map((h, i) => ({
    name: i + 1,
    wpm: h.wpm,
    acc: h.accuracy,
    date: new Date(h.date).toLocaleDateString()
  }));

  return (
    <div className="w-full max-w-4xl space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
          <Activity className="text-brand-500" /> Progress Tracking
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#4b5563', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="wpm" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9' }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="acc" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-xl">
           <h3 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <Activity className="text-red-500" /> Problem Keys (Heatmap)
          </h3>
          {problemKeysData.length > 0 ? (
             <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={problemKeysData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                 <XAxis type="number" stroke="#666" />
                 <YAxis dataKey="key" type="category" stroke="#fff" width={30} />
                 <Tooltip cursor={{fill: '#333'}} contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#4b5563' }} />
                 <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No errors recorded yet!
            </div>
          )}
        </div>

        <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-200 mb-2">Finger Tutor</h3>
            <p className="text-gray-400 mb-4">
              Focus on keeping your index fingers on <span className="text-brand-500 font-bold">F</span> and <span className="text-brand-500 font-bold">J</span>.
            </p>
            <div className="p-4 bg-dark-900 rounded border border-gray-800 text-sm text-gray-300">
              Most missed key: <span className="text-red-400 font-bold text-lg">{problemKeysData[0]?.key || 'None'}</span>
              <br/>
              Recommended drill: <span className="text-brand-400">Basic Home Row</span>
            </div>
        </div>
      </div>
    </div>
  );
};