import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { Shield, Terminal, AlertTriangle } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.detail || 'Login failed')
        return
      }
      const { access_token, role } = await res.json()
      setAuth(access_token, username, role)
      navigate('/')
    } catch {
      setError('Connection failed — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-goat-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-goat-surface border border-goat-border mb-4 animate-glow">
            <Terminal className="w-7 h-7 text-goat-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            <span className="text-goat-accent">VAI</span>
          </h1>
          <p className="font-mono text-xs text-goat-muted mt-1 tracking-widest uppercase">
            Vulnerable AI · Security Lab
          </p>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/40 rounded-lg p-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-amber-300/80 leading-relaxed">
            <strong className="text-amber-400">WARNING:</strong> This platform contains intentionally
            vulnerable AI systems. Use only in isolated environments for educational purposes.
          </p>
        </div>

        {/* Login form */}
        <div className="card glow-border">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-goat-border">
            <Shield className="w-4 h-4 text-goat-muted" />
            <span className="font-mono text-xs text-goat-muted uppercase tracking-wider">Authentication Required</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-goat-muted uppercase tracking-wider block mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="player"
                autoComplete="username"
                className="w-full bg-goat-bg border border-goat-border rounded px-3 py-2 font-mono text-sm text-goat-text
                           placeholder:text-goat-muted/40 focus:outline-none focus:border-goat-accent focus:ring-1 focus:ring-goat-accent/30
                           transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-xs text-goat-muted uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-goat-bg border border-goat-border rounded px-3 py-2 font-mono text-sm text-goat-text
                           placeholder:text-goat-muted/40 focus:outline-none focus:border-goat-accent focus:ring-1 focus:ring-goat-accent/30
                           transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-goat-red font-mono text-xs bg-red-950/30 border border-red-900/40 rounded px-3 py-2">
                <span className="text-goat-red">✗</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border border-goat-bg/60 border-t-goat-bg rounded-full animate-spin" />
                  <span className="font-mono text-sm">Authenticating...</span>
                </>
              ) : (
                <span className="font-mono text-sm tracking-wide">Access Lab</span>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-goat-border">
            <p className="font-mono text-xs text-goat-muted text-center">
              Default credentials: <span className="text-goat-accent">player</span> / <span className="text-goat-accent">llmgoat</span>
            </p>
          </div>
        </div>

        <p className="text-center font-mono text-xs text-goat-muted/50 mt-6">
          OWASP LLM Top 10 (2025) · OWASP Agentic Top 10 (2026)
        </p>
      </div>
    </div>
  )
}
