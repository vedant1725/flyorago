import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, ArrowRight, LayoutGrid } from 'lucide-react';
import './dashboard.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-teal-50 text-flyora-teal flex items-center justify-center mb-6">
        <PlaneTakeoff size={32} className="plane-icon" />
      </div>

      <h1 className="text-4xl font-black text-flyora-navy tracking-tight">404 - Page Lost In Transit</h1>
      <p className="text-xs text-gray-400 mt-2.5 max-w-sm font-semibold leading-relaxed">
        The destination page you are looking for has been moved, archived, or is currently undergoing customs inspection.
      </p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          className="fly-btn fly-btn-primary flex items-center gap-1 text-xs px-6 py-2.5 font-bold"
          onClick={() => navigate('/dashboard')}
        >
          <LayoutGrid size={14} /> Go to Dashboard
        </button>
        <button
          type="button"
          className="fly-btn fly-btn-secondary flex items-center gap-1 text-xs px-6 py-2.5 font-bold"
          onClick={() => navigate(-1)}
        >
          Back <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
