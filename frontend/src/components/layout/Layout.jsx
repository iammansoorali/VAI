import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Terminal, LayoutDashboard, LogOut, Shield, User } from 'lucide-react'
import { useAuthStore } from '../../store/auth'

export default function Layout() {
  const { username, role, logout } = useAuthStore()
  const navigate = useNavigate()
  function handleLogout() { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-goat-bg overflow-hidden">
      <aside className="w-52 flex-shrink-0 bg-goat-surface border-r border-goat-border flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-goat-border">
          <div className="w-7 h-7 bg-goat-accent/10 border border-goat-accent/30 rounded flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-goat-accent" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-white leading-none">
              <span className="text-goat-accent">VAI</span>
            </div>
            <div className="font-mono text-[9px] text-goat-muted leading-none mt-0.5 uppercase tracking-widest">
              Vulnerable AI
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <NavItem to="/" icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Dashboard" end />
          <NavItem to="/challenges" icon={<Shield className="w-3.5 h-3.5" />} label="Challenges" />
        </nav>

        <div className="px-3 py-3 border-t border-goat-border">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded">
            <div className="w-6 h-6 bg-goat-accent/10 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-goat-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-goat-text truncate">{username}</div>
              <div className="font-mono text-[9px] text-goat-muted uppercase">{role}</div>
            </div>
            <button onClick={handleLogout} className="text-goat-muted hover:text-goat-red transition-colors" title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink to={to} end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-mono transition-all duration-150 ${
          isActive ? 'bg-goat-accent/10 text-goat-accent border border-goat-accent/20'
                   : 'text-goat-muted hover:text-goat-text hover:bg-goat-bg'
        }`}>
      {icon}{label}
    </NavLink>
  )
}
