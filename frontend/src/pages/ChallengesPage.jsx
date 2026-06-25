import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle2, Circle, AlertCircle, Shield, Cpu } from 'lucide-react'
import { apiRequest } from '../store/auth'

const ALL_CHALLENGES = [
  { id:'llm01-direct',       owasp_id:'LLM01:2025', title:'Direct Prompt Injection',      difficulty:'beginner',     category:'LLM',     tags:['prompt-injection','jailbreak'],    persona:'💬' },
  { id:'llm01-indirect',     owasp_id:'LLM01:2025', title:'Indirect Prompt Injection',     difficulty:'intermediate', category:'LLM',     tags:['prompt-injection','rag'],          persona:'🔬' },
  { id:'llm02-training-data',owasp_id:'LLM02:2025', title:'Training Data Extraction',      difficulty:'intermediate', category:'LLM',     tags:['info-disclosure','pii'],           persona:'👥' },
  { id:'llm03-supply-chain', owasp_id:'LLM03:2025', title:'Poisoned Plugin',               difficulty:'intermediate', category:'LLM',     tags:['supply-chain'],                   persona:'👨‍💻' },
  { id:'llm04-data-poisoning',owasp_id:'LLM04:2025',title:'RAG Data Poisoning',            difficulty:'intermediate', category:'LLM',     tags:['data-poisoning','rag'],            persona:'🔬' },
  { id:'llm05-output',       owasp_id:'LLM05:2025', title:'Improper Output Handling',      difficulty:'intermediate', category:'LLM',     tags:['output-handling','xss'],           persona:'📝' },
  { id:'llm06-agency',       owasp_id:'LLM06:2025', title:'Excessive Agency',              difficulty:'intermediate', category:'LLM',     tags:['excessive-agency','tools'],        persona:'💰' },
  { id:'llm07-leakage',      owasp_id:'LLM07:2025', title:'System Prompt Leakage',         difficulty:'beginner',     category:'LLM',     tags:['system-prompt','leakage'],         persona:'✨' },
  { id:'llm08-vector',       owasp_id:'LLM08:2025', title:'Embedding Weakness',            difficulty:'expert',       category:'LLM',     tags:['embeddings','vector-db'],          persona:'🔬' },
  { id:'llm09-misinfo',      owasp_id:'LLM09:2025', title:'Hallucination Weaponization',   difficulty:'intermediate', category:'LLM',     tags:['misinformation','hallucination'],  persona:'⚖️' },
  { id:'llm10-unbounded',    owasp_id:'LLM10:2025', title:'Unbounded Consumption',         difficulty:'beginner',     category:'LLM',     tags:['dos','token-abuse'],               persona:'🤖' },
  { id:'asi01-goal-hijack',  owasp_id:'ASI01:2026', title:'Agent Goal Hijack',             difficulty:'intermediate', category:'Agentic', tags:['goal-hijack','agent'],            persona:'💰' },
  { id:'asi02-tool-misuse',  owasp_id:'ASI02:2026', title:'Tool Misuse & Exploitation',    difficulty:'intermediate', category:'Agentic', tags:['tool-misuse','chaining'],          persona:'🔧' },
  { id:'asi03-privilege',    owasp_id:'ASI03:2026', title:'Identity & Privilege Abuse',    difficulty:'expert',       category:'Agentic', tags:['privilege-escalation','identity'], persona:'🔧' },
  { id:'asi04-supply-chain', owasp_id:'ASI04:2026', title:'Agentic Supply Chain (MCP)',    difficulty:'expert',       category:'Agentic', tags:['supply-chain','mcp'],             persona:'🔌' },
  { id:'asi05-rce',          owasp_id:'ASI05:2026', title:'Unexpected Code Execution',     difficulty:'expert',       category:'Agentic', tags:['rce','code-execution'],            persona:'👨‍💻' },
  { id:'asi06-memory',       owasp_id:'ASI06:2026', title:'Memory & Context Poisoning',    difficulty:'expert',       category:'Agentic', tags:['memory','persistence'],            persona:'🤖' },
  { id:'asi07-inter-agent',  owasp_id:'ASI07:2026', title:'Insecure Inter-Agent Comms',    difficulty:'expert',       category:'Agentic', tags:['a2a','spoofing'],                  persona:'🕸' },
  { id:'asi08-cascading',    owasp_id:'ASI08:2026', title:'Cascading Failures',            difficulty:'expert',       category:'Agentic', tags:['cascading','resilience'],          persona:'🏥' },
  { id:'asi09-trust',        owasp_id:'ASI09:2026', title:'Human-Agent Trust Exploit',     difficulty:'intermediate', category:'Agentic', tags:['social-eng','trust'],             persona:'🎭' },
  { id:'asi10-rogue',        owasp_id:'ASI10:2026', title:'Rogue Agent',                   difficulty:'expert',       category:'Agentic', tags:['rogue','misalignment'],           persona:'☁️' },
]

const DIFF = {
  beginner:     { label:'Beginner',     color:'text-emerald-400', ring:'border-emerald-800/40 bg-emerald-950/30' },
  intermediate: { label:'Intermediate', color:'text-amber-400',   ring:'border-amber-800/40 bg-amber-950/30' },
  expert:       { label:'Expert',       color:'text-red-400',     ring:'border-red-800/40 bg-red-950/30' },
}

export default function ChallengesPage() {
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(new Set())
  const [filter, setFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [search, setSearch] = useState('')

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

  const filtered = ALL_CHALLENGES.filter(c => {
    if (filter === 'llm' && c.category !== 'LLM') return false
    if (filter === 'agentic' && c.category !== 'Agentic') return false
    if (diffFilter !== 'all' && c.difficulty !== diffFilter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) &&
        !c.owasp_id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Security Challenges
          </h1>
          <p className="font-mono text-xs text-goat-muted mt-1">
            Browse, search, and attack vulnerable-by-design AI models and autonomous agents.
          </p>
        </div>

        {/* Category panels - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryPanel title="LLM Top 10" subtitle="2025" icon={<Shield className="w-4 h-4 text-blue-400" />}
            challenges={llm} completed={completed} color="blue" onClick={id => navigate(`/challenge/${id}`)} />

          <CategoryPanel title="Agentic Top 10" subtitle="2026" icon={<Cpu className="w-4 h-4 text-purple-400" />}
            challenges={asi} completed={completed} color="purple" onClick={id => navigate(`/challenge/${id}`)} />
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <div className="flex gap-1 bg-goat-surface border border-goat-border rounded-lg p-1">
            {[['all','All'],['llm','LLM'],['agentic','Agentic']].map(([v,l]) => (
              <button key={v} onClick={()=>setFilter(v)}
                className={`px-3 py-1 rounded font-mono text-xs transition-all ${filter===v?'bg-goat-accent text-goat-bg font-semibold':'text-goat-muted hover:text-goat-text'}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-goat-surface border border-goat-border rounded-lg p-1">
            {[['all','All'],['beginner','Beginner'],['intermediate','Intermediate'],['expert','Expert']].map(([v,l]) => (
              <button key={v} onClick={()=>setDiffFilter(v)}
                className={`px-3 py-1 rounded font-mono text-xs transition-all ${diffFilter===v?'bg-goat-accent text-goat-bg font-semibold':'text-goat-muted hover:text-goat-text'}`}>{l}</button>
            ))}
          </div>
          <div className="font-mono text-xs text-goat-muted ml-2">{done}/{total} completed</div>
          <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
            className="bg-goat-surface border border-goat-border rounded-lg px-3 py-1.5 font-mono text-xs text-goat-text
                       placeholder:text-goat-muted/50 focus:outline-none focus:border-goat-accent transition-colors ml-auto w-44" />
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(c => (
            <ChallengeCard key={c.id} challenge={c} completed={completed.has(c.id)} onClick={() => navigate(`/challenge/${c.id}`)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <AlertCircle className="w-8 h-8 text-goat-muted mx-auto mb-2" />
            <p className="font-mono text-sm text-goat-muted">No challenges match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryPanel({ title, subtitle, icon, challenges, completed, color, onClick }) {
  const done = challenges.filter(c => completed.has(c.id)).length
  const borderActive = color === 'blue' ? 'border-blue-800/30' : 'border-purple-800/30'
  return (
    <div className={`card border ${borderActive} flex flex-col`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <div className="font-display text-sm font-semibold text-white">{title}</div>
            <div className="font-mono text-[10px] text-goat-muted">{subtitle}</div>
          </div>
        </div>
        <span className="font-mono text-xs text-goat-muted">{done}/{challenges.length}</span>
      </div>
      <div className="space-y-1 flex-1 overflow-y-auto max-h-48">
        {challenges.map(c => (
          <button key={c.id} onClick={() => onClick(c.id)}
            className="w-full flex items-center gap-2 py-1 px-1.5 rounded hover:bg-goat-bg transition-colors text-left group">
            {completed.has(c.id)
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              : <Circle className="w-3.5 h-3.5 text-goat-border flex-shrink-0" />}
            <span className={`font-mono text-[11px] flex-1 truncate transition-colors ${
              completed.has(c.id) ? 'text-emerald-400/80' : 'text-goat-muted group-hover:text-goat-text'}`}>{c.title}</span>
            <span className={`font-mono text-[9px] px-1 py-0.5 rounded border flex-shrink-0 ${DIFF[c.difficulty].ring} ${DIFF[c.difficulty].color}`}>
              {c.difficulty[0].toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ChallengeCard({ challenge:c, completed, onClick }) {
  const diff = DIFF[c.difficulty]
  const isLLM = c.category === 'LLM'
  return (
    <button onClick={onClick}
      className={`card text-left transition-all duration-200 group relative cursor-pointer
        ${completed ? 'border-emerald-800/50 bg-emerald-950/10' : 'hover:border-goat-accent/40'}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${isLLM?'tag-llm':'tag-asi'}`}>{c.owasp_id}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{c.persona}</span>
          {completed
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            : <Circle className="w-4 h-4 text-goat-border flex-shrink-0" />}
        </div>
      </div>
      <h3 className={`font-display text-sm font-semibold mb-2 leading-tight transition-colors
        ${completed ? 'text-emerald-300' : 'text-white group-hover:text-goat-accent'}`}>{c.title}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${diff.ring} ${diff.color}`}>{diff.label}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-goat-bg border border-goat-border text-goat-muted">{c.tags[0]}</span>
        </div>
        <ChevronRight className="w-3 h-3 text-goat-muted group-hover:text-goat-accent group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  )
}
