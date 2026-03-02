import { useNavigate } from 'react-router-dom';
import { Leaf, Users, TrendingUp, Shield, Car, Sprout } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import StatCard from '../components/StatCard';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-medium text-emerald-800">Sustainable Corporate Mobility</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 mb-6 leading-tight">
                Share rides.<br />
                Save the planet.
              </h1>
              <p className="text-xl text-stone-600 mb-8 leading-relaxed">
                Connect with colleagues heading your way. Reduce emissions, cut costs, 
                and build a greener workplace culture—one shared journey at a time.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-lg shadow-lg shadow-emerald-600/20"
                >
                  Start Carpooling
                </button>
                <button className="px-8 py-4 border-2 border-stone-300 text-stone-700 rounded-lg hover:border-emerald-600 hover:text-emerald-700 transition-all font-semibold text-lg">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(20,184,166,0.1),transparent_50%)]"></div>
                <Car className="w-full h-full text-emerald-700 opacity-20 absolute inset-0 m-auto" />
                <div className="relative z-10 space-y-6">
                  <StatCard value="2.4k" label="CO₂ Tons Saved" />
                  <StatCard value="850+" label="Active Carpoolers" />
                  <StatCard value="12k" label="Shared Rides" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">
              Why Choose GreenCommute?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              A complete platform designed for modern organizations committed to sustainability
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Leaf className="w-8 h-8" />}
              title="Environmental Impact"
              description="Track real-time CO₂ savings, earn sustainability points, and contribute to your organization's ESG goals."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Smart Matching"
              description="AI-powered route matching connects you with colleagues along your commute path automatically."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Safety First"
              description="Verified corporate email domains, driver document checks, and real-time trip tracking for peace of mind."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Gamification"
              description="Earn points, climb leaderboards, unlock rewards, and make sustainable commuting fun and engaging."
            />
            <FeatureCard 
              icon={<Car className="w-8 h-8" />}
              title="Flexible Options"
              description="Whether you drive or ride, choose car or bike, and find the perfect match for your schedule."
            />
            <FeatureCard 
              icon={<Sprout className="w-8 h-8" />}
              title="Cost Savings"
              description="Split fuel costs fairly, reduce vehicle maintenance, and save money while reducing your carbon footprint."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of colleagues already making a difference
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-white text-emerald-900 rounded-lg hover:bg-emerald-50 transition-all font-semibold text-lg shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
