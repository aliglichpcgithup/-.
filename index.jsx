import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Utensils, BookOpen, Settings, Plus, Droplets, 
  Search, Info, Trash2, Calendar, Target, TrendingDown, Scale
} from 'lucide-react';

// --- Данные ---
const FOODS = [
  { n: "Куриная грудка", p: "A", cat: "Мясо" }, { n: "Говядина постная", p: "A", cat: "Мясо" },
  { n: "Яйца", p: "A", cat: "Белок" }, { n: "Творог 0%", p: "A", cat: "Молочное" },
  { n: "Кефир 0%", p: "A", cat: "Молочное" }, { n: "Рыба любая", p: "A", cat: "Морепродукты" },
  { n: "Овсяные отруби", p: "A", cat: "Злаки" }, { n: "Огурцы", p: "C", cat: "Овощи" },
  { n: "Помидоры", p: "C", cat: "Овощи" }, { n: "Капуста", p: "C", cat: "Овощи" },
  { n: "Грибы", p: "C", cat: "Овощи" }, { n: "Кабачки", p: "C", cat: "Овощи" }
];

const RECIPES = [
  {
    title: "Лепешка из отрубей",
    phase: "A",
    time: "10 мин",
    ingred: "2 ст.л. отрубей, 1 яйцо, 1 ст.л. творога 0%",
    steps: "Смешать всё до однородности. Выпекать на антипригарной сковороде без масла 2-3 минуты с каждой стороны."
  },
  {
    title: "Куриный рулет",
    phase: "A",
    time: "40 мин",
    ingred: "Филе, чеснок, специи, желатин",
    steps: "Нарезать филе, смешать со специями и сухим желатином. Плотно завернуть в фольгу и запекать при 180°C."
  }
];

export default function App() {
  const [screen, setScreen] = useState('setup');
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('dukan_ultra_v2');
    return saved ? JSON.parse(saved) : { plan: null, logs: [], water: {} };
  });

  useEffect(() => {
    localStorage.setItem('dukan_ultra_v2', JSON.stringify(state));
    if (state.plan && screen === 'setup') setScreen('dash');
  }, [state, screen]);

  const handleCreatePlan = (e) => {
    e.preventDefault();
    const s = parseFloat(e.target.startW.value);
    const t = parseFloat(e.target.targetW.value);
    if (!s || !t || s <= t) return;

    const diff = s - t;
    const attack = diff > 20 ? 7 : diff > 10 ? 5 : diff > 5 ? 3 : 2;

    setState({
      plan: {
        startW: s,
        targetW: t,
        startDate: Date.now(),
        attackDays: attack,
        cruiseDays: Math.round(diff * 7),
        consolDays: Math.round(diff * 10),
        rhythm: e.target.rhythm.value
      },
      logs: [{ date: Date.now(), w: s }],
      water: {}
    });
    setScreen('dash');
  };

  const addWeight = (val) => {
    if (!val) return;
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, { date: Date.now(), w: parseFloat(val) }]
    }));
  };

  const toggleWater = (idx) => {
    const today = new Date().toLocaleDateString();
    const current = state.water[today] || 0;
    setState(prev => ({
      ...prev,
      water: { ...prev.water, [today]: idx + 1 === current ? idx : idx + 1 }
    }));
  };

  if (screen === 'setup') return <SetupScreen onCreate={handleCreatePlan} />;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] font-sans selection:bg-emerald-100">
      {/* iOS Style Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-5 pt-12 pb-4">
        <div className="max-w-md mx-auto flex justify-between items-end">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Dukan Tracker</p>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {screen === 'dash' && 'Обзор'}
              {screen === 'foods' && 'Продукты'}
              {screen === 'recipes' && 'Рецепты'}
              {screen === 'settings' && 'Профиль'}
            </h1>
          </div>
          <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
            День {Math.floor((Date.now() - state.plan.startDate) / 86400000) + 1}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 pb-32 space-y-6">
        {screen === 'dash' && <Dashboard state={state} onAddWeight={addWeight} onWater={toggleWater} />}
        {screen === 'foods' && <FoodList />}
        {screen === 'recipes' && <Recipes />}
        {screen === 'settings' && <SettingsScreen state={state} onReset={() => setState({plan:null, logs:[], water:{}})} />}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <TabItem active={screen === 'dash'} onClick={() => setScreen('dash')} icon={<LayoutDashboard size={22}/>} label="Обзор" />
          <TabItem active={screen === 'foods'} onClick={() => setScreen('foods')} icon={<Utensils size={22}/>} label="Еда" />
          <TabItem active={screen === 'recipes'} onClick={() => setScreen('recipes')} icon={<BookOpen size={22}/>} label="Рецепты" />
          <TabItem active={screen === 'settings'} onClick={() => setScreen('settings')} icon={<Settings size={22}/>} label="План" />
        </div>
      </nav>
    </div>
  );
}

function SetupScreen({ onCreate }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-3">
            <Scale size={40} color="white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-4">Dukan Pro</h1>
          <p className="text-slate-500">Ваш путь к идеальному весу</p>
        </div>

        <form onSubmit={onCreate} className="bg-white rounded-[2rem] p-8 shadow-sm space-y-5">
          <div className="space-y-4">
            <Input label="Текущий вес" name="startW" unit="кг" placeholder="85" />
            <Input label="Целевой вес" name="targetW" unit="кг" placeholder="70" />
            <div>
              <label className="text-[13px] font-semibold text-gray-400 ml-1 uppercase">Ритм чередования</label>
              <select name="rhythm" className="w-full mt-1 bg-gray-50 p-4 rounded-2xl border-none outline-none appearance-none font-medium">
                <option value="1/1">1 через 1 (Рекомендуется)</option>
                <option value="2/2">2 через 2</option>
                <option value="5/5">5 через 5</option>
              </select>
            </div>
          </div>
          <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-transform">
            Рассчитать план
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ state, onAddWeight, onWater }) {
  const currentW = state.logs[state.logs.length - 1]?.w || state.plan.startW;
  const lost = (state.plan.startW - currentW).toFixed(1);
  const todayStr = new Date().toLocaleDateString();
  const waterCount = state.water[todayStr] || 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Status Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Текущая фаза</h3>
            <h2 className="text-3xl font-black text-slate-900">Атака</h2>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl">
            <TrendingDown className="text-emerald-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Вес</p>
            <p className="text-xl font-black">{currentW} <span className="text-sm font-normal text-slate-400">кг</span></p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Потеряно</p>
            <p className="text-xl font-black text-emerald-500">-{lost} <span className="text-sm font-normal opacity-60">кг</span></p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => {
            const val = window.prompt("Введите текущий вес:");
            if (val) onAddWeight(val);
          }}
          className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span className="text-xs font-bold text-slate-600">Записать вес</span>
        </button>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-2">
           <div className="flex gap-1">
             {[...Array(5)].map((_, i) => (
               <div key={i} className={`w-1.5 h-6 rounded-full ${i < waterCount ? 'bg-blue-400' : 'bg-gray-100'}`} />
             ))}
           </div>
           <button onClick={() => onWater(waterCount)} className="text-xs font-bold text-blue-500">Пить воду</button>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-tighter">Динамика веса</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={state.logs}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="w" stroke="#10b981" strokeWidth={4} fill="url(#chartGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function FoodList() {
  const [q, setQ] = useState('');
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input 
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Найти продукт..."
          className="w-full bg-white border-none py-4 pl-12 pr-4 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>
      <div className="bg-white rounded-3xl shadow-sm divide-y divide-gray-50 overflow-hidden">
        {FOODS.filter(f => f.n.toLowerCase().includes(q.toLowerCase())).map((f, i) => (
          <div key={i} className="p-4 flex justify-between items-center active:bg-gray-50 transition-colors">
            <div>
              <p className="font-bold text-slate-800">{f.n}</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">{f.cat}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${f.p === 'A' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              {f.p === 'A' ? 'Атака' : 'Чередование'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recipes() {
  return (
    <div className="space-y-4">
      {RECIPES.map((r, i) => (
        <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-3 active:scale-[0.98] transition-transform">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">Фаза {r.phase}</span>
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Calendar size={12}/> {r.time}</span>
          </div>
          <h3 className="text-lg font-black text-slate-800">{r.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-emerald-100 pl-3">{r.ingred}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{r.steps}</p>
        </div>
      ))}
    </div>
  );
}

function SettingsScreen({ state, onReset }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
        <h4 className="font-black text-lg mb-4">Детали плана</h4>
        <div className="space-y-4">
          <PlanRow label="Атака" value={`${state.plan.attackDays} дн.`} color="bg-red-400" />
          <PlanRow label="Чередование" value={`~${state.plan.cruiseDays} дн.`} color="bg-blue-400" />
          <PlanRow label="Закрепление" value={`${state.plan.consolDays} дн.`} color="bg-amber-400" />
          <PlanRow label="Ритм" value={state.plan.rhythm} color="bg-purple-400" />
        </div>
      </div>
      
      <button 
        onClick={() => window.confirm("Сбросить всё?") && onReset()}
        className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
      >
        <Trash2 size={18} /> Сбросить данные
      </button>
    </div>
  );
}

// --- Вспомогательные компоненты ---
function Input({ label, unit, ...props }) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-gray-400 ml-1 uppercase tracking-tight">{label}</label>
      <div className="relative mt-1">
        <input {...props} type="number" step="0.1" className="w-full bg-gray-50 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg transition-all" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-300">{unit}</span>
      </div>
    </div>
  );
}

function PlanRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="font-semibold text-slate-600">{label}</span>
      </div>
      <span className="font-black text-slate-900">{value}</span>
    </div>
  );
}

function TabItem({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${active ? 'text-emerald-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}>
      <div className="p-1">{icon}</div>
      <span className={`text-[9px] font-bold uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
  );
}