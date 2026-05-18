import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Zap, BarChart3 } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">Smart Leads</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Manage Your Leads with Intelligence</h1>
          <p className="text-xl text-gray-500">A powerful, intuitive dashboard for sales teams to track, manage, and convert leads effectively.</p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">Start Free Trial</Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">View Demo</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Users, title: 'Lead Management', desc: 'Full CRUD operations with real-time updates' },
            { icon: Shield, title: 'Role-Based Access', desc: 'Admin and Sales User roles with secure permissions' },
            { icon: BarChart3, title: 'Advanced Filters', desc: 'Search, filter, sort and export your data' },
            { icon: Zap, title: 'Fast & Modern', desc: 'Built with React, TypeScript, and Tailwind CSS' },
          ].map((feature, i) => (
            <div key={i} className="card p-6">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">Built with MERN Stack • Smart Leads Dashboard © 2024</div>
      </footer>
    </div>
  );
}