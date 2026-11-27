import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Plane, MapPin,
  ShieldCheck, Users, Activity,
  Clock
} from 'lucide-react';

interface RouteData {
  id: string;
  fromCity: string;
  fromFlag: string;
  toCity: string;
  toFlag: string;
  deliveryWindow: string;
  status: string;
  updatedAt: string;
  to: string;
}

const routes: RouteData[] = [
  {
    id: 'r1',
    fromCity: 'Ahmedabad',
    fromFlag: '🇮🇳',
    toCity: 'London',
    toFlag: '🇬🇧',
    deliveryWindow: '2–5 Days',
    status: 'Active',
    updatedAt: 'India ➔ UK Corridor',
    to: '/india-to-uk'
  },
  {
    id: 'r2',
    fromCity: 'Mumbai',
    fromFlag: '🇮🇳',
    toCity: 'Dubai',
    toFlag: '🇦🇪',
    deliveryWindow: '1–3 Days',
    status: 'Active',
    updatedAt: 'India ➔ UAE Corridor',
    to: '/india-to-uae'
  },
  {
    id: 'r3',
    fromCity: 'Delhi',
    fromFlag: '🇮🇳',
    toCity: 'Toronto',
    toFlag: '🇨🇦',
    deliveryWindow: '3–6 Days',
    status: 'Active',
    updatedAt: 'India ➔ Canada Corridor',
    to: '/india-to-canada'
  },
  {
    id: 'r4',
    fromCity: 'Bengaluru',
    fromFlag: '🇮🇳',
    toCity: 'New York',
    toFlag: '🇺🇸',
    deliveryWindow: '2–6 Days',
    status: 'Active',
    updatedAt: 'India ➔ USA Corridor',
    to: '/india-to-usa'
  }
];

const PopularRoutes: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden" id="routes">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.03),transparent_70%)]" />
        <div className="absolute inset-0 world-map-bg opacity-5 mix-blend-overlay" />
      </div>

      <div className="container-flyora relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-flyora-teal/10 border border-flyora-teal/20 text-flyora-teal-dark font-bold text-xs uppercase tracking-widest mb-4">
              Global Network
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-flyora-navy mb-4 leading-tight tracking-tight">
              Popular Corridors Connecting <br className="hidden md:block" />
              India &amp; the World
            </h2>
            <p className="text-lg text-flyora-gray-600 leading-relaxed">
              Explore high-demand international flight corridors where KYC-verified travelers share spare luggage capacity with senders.
            </p>
          </div>
          <Link to="/international-package-delivery" className="inline-flex items-center gap-2 text-flyora-teal font-bold group hover:text-flyora-navy transition-colors shrink-0">
            Explore Global Delivery
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex md:grid md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {routes.map((route) => (
            <Link
              key={route.id}
              to={route.to}
              className="group relative flex flex-col bg-white rounded-[24px] border border-flyora-gray-200 shadow-sm hover:shadow-[0_20px_40px_rgba(10,22,40,0.08)] hover:-translate-y-2 hover:border-flyora-teal/30 transition-all duration-500 w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center"
            >
              <div className="h-32 rounded-t-[24px] bg-gradient-to-br from-flyora-navy/5 to-flyora-teal/5 relative overflow-hidden flex items-center justify-center border-b border-flyora-gray-100">
                <div className="absolute inset-x-8 top-1/2 border-t-2 border-dashed border-flyora-teal/20" />
                <div className="absolute top-1/2 left-8 w-2 h-2 rounded-full bg-flyora-teal -translate-y-1/2 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                <div className="absolute top-1/2 right-8 w-2 h-2 rounded-full bg-blue-500 -translate-y-1/2 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <div className="relative z-10 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:translate-x-16 transition-transform duration-700 ease-in-out">
                  <Plane size={18} className="text-flyora-navy" />
                </div>
              </div>

              <div className="p-6 md:p-7 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl">{route.fromFlag}</span>
                    <span className="font-bold text-flyora-navy text-sm uppercase tracking-wide">{route.fromCity}</span>
                  </div>
                  <div className="flex-1 px-4 text-center text-flyora-gray-400">
                    <Plane size={16} className="mx-auto text-flyora-teal opacity-60" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl">{route.toFlag}</span>
                    <span className="font-bold text-flyora-navy text-sm uppercase tracking-wide">{route.toCity}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-flyora-gray-600 leading-tight">KYC Verified Travelers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-flyora-gray-600 leading-tight">Escrow &amp; OTP Protection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-purple-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-flyora-gray-600 leading-tight">Open Package Inspection</span>
                  </div>
                </div>

                <hr className="border-flyora-gray-100 mb-5" />

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-flyora-gray-400 uppercase tracking-wider block mb-1">Typical Flight</span>
                    <div className="flex items-center gap-1.5 text-flyora-navy font-bold text-sm">
                      <Clock size={14} className="text-flyora-teal" />
                      {route.deliveryWindow}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-flyora-gray-400 uppercase tracking-wider block mb-1">Status</span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs border border-emerald-100">
                      <Activity size={12} />
                      {route.status}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-xs text-flyora-gray-500 font-medium">{route.updatedAt}</span>
                  <span className="text-sm font-bold text-flyora-navy flex items-center gap-1 group-hover:text-flyora-teal transition-colors">
                    Explore Route
                    <ArrowRight size={16} className="text-flyora-teal group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;
