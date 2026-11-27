import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlaneTakeoff, ArrowRight, Home } from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import './dashboard.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
      <SeoHead
        title="404 — Page Not Found | Flyorago"
        description="The requested Flyorago page could not be found. Return to the homepage or browse international delivery guides."
        path="/404"
        noindex
      />
      <div className="w-16 h-16 rounded-full bg-teal-50 text-flyora-teal flex items-center justify-center mb-6">
        <PlaneTakeoff size={32} className="plane-icon" />
      </div>

      <h1 className="text-4xl font-black text-flyora-navy tracking-tight">404 - Page Lost In Transit</h1>
      <p className="text-sm text-gray-500 mt-3 max-w-md font-medium leading-relaxed">
        The destination page you are looking for has been moved, archived, or does not exist.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="fly-btn fly-btn-primary inline-flex items-center gap-1.5 text-xs px-6 py-2.5 font-bold"
        >
          <Home size={14} /> Go Home
        </Link>
        <button
          type="button"
          className="fly-btn fly-btn-secondary inline-flex items-center gap-1 text-xs px-6 py-2.5 font-bold"
          onClick={() => navigate(-1)}
        >
          Back <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
