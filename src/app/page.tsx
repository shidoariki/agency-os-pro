// src/app/page.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useQuoteStore, SERVICES } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, PenTool, LineChart, CheckCircle2, Sparkles, 
  Zap, Search, Plus, Minus, DollarSign, LayoutPanelLeft, Layers, Globe
} from 'lucide-react'; 
import { useState, useEffect } from 'react';
import { generatePDF } from '@/lib/pdf-generator';

const CATEGORIES = ['All', 'Development', 'Design', 'Marketing', 'Extras'];

export default function Home() {
  const { 
    selectedItems, addItem, removeItem, updateQuantity, updateItemPrice,
    subtotal, total, discount, tax, setDiscount, setTax, notes, setNotes,
    currency, setCurrency, currencySymbol 
  } = useQuoteStore();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // FIX: Hydration Error (Ensures random ID only runs on client)
  useEffect(() => {
    setIsMounted(true);
    setQuoteId(Math.random().toString(36).substr(2, 8).toUpperCase());
  }, []);

  // FIX: All Category Filtering
  const filteredServices = SERVICES.filter(s => {
    const matchesTab = activeTab === 'All' || s.category === activeTab;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* 25x NAV BAR */}
      <nav className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><Zap size={20} fill="currentColor"/></div>
          <span className="font-black text-2xl tracking-tighter">AgencyOS <span className="text-indigo-600">Pro</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-lg border">
            {['USD', 'EUR', 'GBP', 'INR'].map(c => (
              <button key={c} onClick={() => setCurrency(c as any)}
                className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${currency === c ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                {c}
              </button>
            ))}
          </div>
          <Badge variant="outline" className="border-indigo-100 text-indigo-600 font-bold px-3 py-1">ID: #{quoteId}</Badge>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        
        {/* CATALOG SIDE */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-grid-slate-100/50">
          <div className="max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Project Architect</h1>
              <p className="text-slate-500 font-medium mt-1">Select modules to build your enterprise-grade proposal.</p>
            </header>

            {/* SMART TABS */}
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border shadow-sm">
              {CATEGORIES.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-300" size={20}/>
              <Input placeholder="Search catalog..." className="pl-12 h-14 bg-white border-slate-200 rounded-2xl text-lg focus-visible:ring-indigo-500 shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {/* THE GRID (Whole-Card Click) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredServices.map(s => {
                const item = selectedItems.find(i => i.id === s.id);
                return (
                  <Card key={s.id} 
                    className={`p-6 cursor-pointer border-2 transition-all group relative overflow-hidden ${item ? 'border-indigo-600 bg-indigo-50/20' : 'border-transparent bg-white hover:border-slate-200 shadow-sm'}`}
                    onClick={() => !item && addItem(s)}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${item ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {getIcon(s.category)}
                      </div>
                      {item && <CheckCircle2 className="text-indigo-600" size={24}/>}
                    </div>
                    <h3 className="font-bold text-slate-900 text-xl">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">{s.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{s.estimatedDays} Days</span>
                       <span className="text-2xl font-black text-slate-900">{currencySymbol}{s.price}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* COMMAND SIDEBAR */}
        <div className="w-[480px] bg-white border-l shadow-2xl flex flex-col z-20">
          <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Draft Proposal</h2>
            <Badge className="bg-indigo-100 text-indigo-700 border-none">{selectedItems.length} Modules</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* SELECTIONS */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stack</p>
              {selectedItems.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center gap-3">
                  <Layers className="text-slate-200" size={32}/>
                  <span className="text-sm font-bold text-slate-400 tracking-tight">Scope is empty</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map(i => (
                    <motion.div layout key={i.id} className="p-4 bg-white rounded-2xl border-2 border-slate-50 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-slate-900">{i.name}</span>
                        <button onClick={() => removeItem(i.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Plus className="rotate-45" size={20}/></button>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        {/* INLINE PRICE EDIT */}
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border flex-1">
                          <span className="text-xs font-bold text-slate-400">{currencySymbol}</span>
                          <input type="number" className="w-full bg-transparent text-sm font-black focus:outline-none" value={i.customPrice} onChange={e => updateItemPrice(i.id, Number(e.target.value))} />
                        </div>
                        <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl p-2 px-4 shadow-lg">
                          <button onClick={() => updateQuantity(i.id, -1)}><Minus size={14}/></button>
                          <span className="text-xs font-black w-4 text-center">{i.quantity}</span>
                          <button onClick={() => updateQuantity(i.id, 1)}><Plus size={14}/></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* BRIEFING */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Narrative</p>
              <Textarea placeholder="Define specific tech requirements, project phases, or hard deadlines..." className="bg-slate-50 border-none rounded-2xl min-h-[140px] text-xs focus-visible:ring-indigo-500" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* FINANCIALS */}
          <div className="p-10 bg-slate-950 text-white rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Discount %</label>
                <Input type="number" className="h-12 bg-slate-900 border-slate-800 text-white font-black" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Tax %</label>
                <Input type="number" className="h-12 bg-slate-900 border-slate-800 text-white font-black" value={tax} onChange={e => setTax(Number(e.target.value))} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Gross Total</p>
                  <p className="text-6xl font-black tracking-tighter">{currencySymbol}{total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                   <p className="text-xl font-bold text-slate-400">{currencySymbol}{subtotal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Button className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-indigo-900/50 transition-all"
              onClick={() => generatePDF({ items: selectedItems, subtotal, discount, tax, total, id: quoteId, notes, currencySymbol })}>
              Generate Enterprise Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// FIX: getIcon logic with all required icons defined
function getIcon(cat: string) {
  switch(cat) {
    case 'Development': return <Code2 size={24}/>;
    case 'Design': return <PenTool size={24}/>;
    case 'Marketing': return <LineChart size={24}/>;
    case 'Extras': return <Zap size={24}/>;
    default: return <Layers size={24}/>;
  }
}