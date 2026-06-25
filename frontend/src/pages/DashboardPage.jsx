import { useState, useEffect } from 'react'
import { CheckCircle2, Shield, Cpu, Award, Zap, Activity } from 'lucide-react'
import { apiRequest } from '../store/auth'

const ALL_CHALLENGES = [
  { id:'llm01-direct',       category:'LLM', difficulty:'beginner' },
  { id:'llm01-indirect',     category:'LLM', difficulty:'intermediate' },
  { id:'llm02-training-data',category:'LLM', difficulty:'intermediate' },
  { id:'llm03-supply-chain', category:'LLM', difficulty:'intermediate' },
  { id:'llm04-data-poisoning',category:'LLM', difficulty:'intermediate' },
  { id:'llm05-output',       category:'LLM', difficulty:'intermediate' },
  { id:'llm06-agency',       category:'LLM', difficulty:'intermediate' },
  { id:'llm07-leakage',      category:'LLM', difficulty:'beginner' },
  { id:'llm08-vector',       category:'LLM', difficulty:'expert' },
  { id:'llm09-misinfo',      category:'LLM', difficulty:'intermediate' },
  { id:'llm10-unbounded',    category:'LLM', difficulty:'beginner' },
  { id:'asi01-goal-hijack',  category:'Agentic', difficulty:'intermediate' },
  { id:'asi02-tool-misuse',  category:'Agentic', difficulty:'intermediate' },
  { id:'asi03-privilege',    category:'Agentic', difficulty:'expert' },
  { id:'asi04-supply-chain', category:'Agentic', difficulty:'expert' },
  { id:'asi05-rce',          category:'Agentic', difficulty:'expert' },
  { id:'asi06-memory',       category:'Agentic', difficulty:'expert' },
  { id:'asi07-inter-agent',  category:'Agentic', difficulty:'expert' },
  { id:'asi08-cascading',    category:'Agentic', difficulty:'expert' },
  { id:'asi09-trust',        category:'Agentic', difficulty:'intermediate' },
  { id:'asi10-rogue',        category:'Agentic', difficulty:'expert' },
]

const DIFF = {
  beginner:     { label:'Beginner',     color:'text-emerald-400' },
  intermediate: { label:'Intermediate', color:'text-amber-400' },
  expert:       { label:'Expert',       color:'text-red-400' },
}

function Donut({ pct, solved, total, size=160, stroke=18 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative flex-shrink-0" style={{ width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2540" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#00d4ff" strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-white">{pct}%</span>
        <span className="font-mono text-xs text-goat-muted mt-0.5">COMPLETED</span>
        <span className="font-mono text-[11px] text-goat-accent mt-0.5">{solved} / {total}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [completed, setCompleted] = useState(new Set())

  useEffect(() => {
    apiRequest('/progress/')
      .then(r => r?.ok && r.json())
      .then(d => d && setCompleted(new Set(d.completed || [])))
      .catch(() => {})
  }, [])

  const llm = ALL_CHALLENGES.filter(c => c.category === 'LLM')
  const asi = ALL_CHALLENGES.filter(c => c.category === 'Agentic')
  const total = ALL_CHALLENGES.length
  const done = ALL_CHALLENGES.filter(c => completed.has(c.id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const diffDone = { beginner:0, intermediate:0, expert:0 }
  const diffTotal = { beginner:0, intermediate:0, expert:0 }
  ALL_CHALLENGES.forEach(c => {
    diffTotal[c.difficulty]++
    if (completed.has(c.id)) diffDone[c.difficulty]++
  })

  const llmDone = llm.filter(c=>completed.has(c.id)).length
  const asiDone = asi.filter(c=>completed.has(c.id)).length

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start border-b border-goat-border/60 pb-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              VAI <span className="text-goat-accent">—</span> Vulnerable AI Security Lab
            </h1>
            <p className="font-mono text-xs text-goat-muted mt-1.5">
              High-level security training environment for Large Language Models and Agentic Systems
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-goat-accent/10 border border-goat-accent/20 text-goat-accent font-mono text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Status
          </div>
        </div>

        {/* Status Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Progress Donut */}
          <div className="card md:col-span-1 flex flex-col items-center justify-center p-6 space-y-4">
            <h3 className="font-display text-sm font-bold text-white text-center tracking-wide w-full border-b border-goat-border/40 pb-2">
              Overall Progress
            </h3>
            <Donut pct={pct} solved={done} total={total} />
          </div>

          {/* Breakdown Stats */}
          <div className="card md:col-span-2 flex flex-col justify-between p-6">
            <div>
              <h3 className="font-display text-sm font-bold text-white tracking-wide border-b border-goat-border/40 pb-2 mb-4">
                Category Completion
              </h3>
              <div className="space-y-4">
                {[
                  { label:'OWASP LLM Top 10 (2025)', done:llmDone, tot:llm.length, bar:'from-blue-500 to-cyan-400', icon: <Shield className="w-4 h-4 text-blue-400" /> },
                  { label:'OWASP Agentic Top 10 (2026)', done:asiDone, tot:asi.length, bar:'from-purple-500 to-pink-400', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
                ].map(g => (
                  <div key={g.label} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {g.icon}
                        <span className="font-mono text-xs text-goat-text font-semibold">{g.label}</span>
                      </div>
                      <span className="font-mono text-xs text-goat-muted">{g.done} / {g.tot} ({g.tot > 0 ? Math.round((g.done/g.tot)*100) : 0}%)</span>
                    </div>
                    <div className="h-2 bg-goat-bg rounded-full overflow-hidden border border-goat-border/30">
                      <div className={`h-full bg-gradient-to-r ${g.bar} rounded-full transition-all duration-1000`}
                        style={{ width:`${g.tot > 0 ? (g.done/g.tot)*100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-goat-border/40 space-y-2 mt-4">
              <h4 className="font-display text-xs font-semibold text-goat-muted uppercase tracking-wider mb-2">Difficulty Stats</h4>
              {['beginner','intermediate','expert'].map(d => (
                <div key={d} className="flex items-center gap-2.5">
                  <span className={`font-mono text-xs w-24 ${DIFF[d].color} font-semibold capitalize`}>{DIFF[d].label}</span>
                  <div className="flex-1 h-1.5 bg-goat-bg rounded-full overflow-hidden border border-goat-border/20">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      d==='beginner'?'bg-emerald-400':d==='intermediate'?'bg-amber-400':'bg-red-400'
                    }`} style={{ width:`${diffTotal[d] > 0 ? (diffDone[d]/diffTotal[d])*100 : 0}%` }} />
                  </div>
                  <span className="font-mono text-xs text-goat-muted w-10 text-right">{diffDone[d]} / {diffTotal[d]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informative Cards / Welcome Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-goat-border/40 pb-2">
              <Zap className="w-4 h-4 text-goat-accent" />
              <h3 className="font-display text-sm font-bold text-white">How to Get Started</h3>
            </div>
            <p className="font-body text-xs text-goat-text leading-relaxed">
              Welcome to the Vulnerable AI Security Lab. This dashboard tracks your lab completion status across categories and difficulty ranges.
            </p>
            <p className="font-body text-xs text-goat-text leading-relaxed">
              To begin practicing, select the <strong className="text-goat-accent">Challenges</strong> tab from the left navigation menu. Each challenge provides an interactive chatbot interface where you can experiment with vulnerability triggers, verify prompt injection paths, and study secure configuration implementations.
            </p>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-goat-border/40 pb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display text-sm font-bold text-white">Lab Objectives</h3>
            </div>
            <ul className="space-y-2 font-body text-xs text-goat-text">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Expose prompt injection boundaries in custom system instructions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Test autonomous agent tools for cascading failures and unauthorized actions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Activate <strong>Secure Mode</strong> to analyze code-level mitigations and guardrails.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
