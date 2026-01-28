import React from 'react';
import { NavLink } from 'react-router-dom';
import { Droplet, Sun, Moon, Activity, BarChart2, ShieldAlert, FlaskConical } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Simulator', path: '/simulator', icon: BarChart2 },
    { name: 'Advisor', path: '/advisor', icon: ShieldAlert },
    // { name: 'Model Lab', path: '/lab', icon: FlaskConical },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Droplet className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            .derp
          </span>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.name}</span>
            </NavLink>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-secondary transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>
    </nav>
  );
}
