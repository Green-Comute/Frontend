import { useNavigate } from 'react-router-dom';
import { Leaf, Users, TrendingUp, Shield, Car, Sprout } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import StatCard from '../components/StatCard';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero Section */}
      <section className="pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
                <Sprout className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-medium text-emerald-800">Sustainable Corporate Mobility</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 mb-5 leading-[1.1] tracking-tight">
                Share rides.<br />
                <span className="text-emerald-600">Save the planet.</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-600 mb-8 leading-relaxed max-w-lg">
                Connect with colleagues heading your way. Reduce emissions, cut costs, 
                and build a greener workplace culture—one shared journey at a time.
              </p>
              <div className="flex flex-col xs:flex-row gap-3">
                <button 
                  onClick={() => navigate('/signup')}
                  className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-emerald-600/20"
                >
                  Start Carpooling
                </button>
                <button className="btn-secondary px-8 py-3.5 text-base">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" aria-hidden="true"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(20,184,166,0.1),transparent_50%)]" aria-hidden="true"></div>
                <Car className="w-full h-full text-emerald-700 opacity-10 absolute inset-0 m-auto" aria-hidden="true" />
                <div className="relative z-10 space-y-5">
                  <StatCard value="2.4k" label="CO₂ Tons Saved" />
                  <StatCard value="850+" label="Active Carpoolers" />
                  <StatCard value="12k" label="Shared Rides" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Stats Row */}
      <section className="lg:hidden px-4 sm:px-6 pb-12" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3">
          <StatCard value="2.4k" label="CO₂ Saved" />
          <StatCard value="850+" label="Carpoolers" />
          <StatCard value="12k" label="Rides" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
              Why Choose GreenCommute?
            </h2>
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
              A complete platform designed for modern organizations committed to sustainability
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <FeatureCard 
              icon={<Leaf className="w-6 h-6" />}
              title="Environmental Impact"
              description="Track real-time CO₂ savings, earn sustainability points, and contribute to your organization's ESG goals."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Smart Matching"
              description="AI-powered route matching connects you with colleagues along your commute path automatically."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Safety First"
              description="Verified corporate email domains, driver document checks, and real-time trip tracking for peace of mind."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Gamification"
              description="Earn points, climb leaderboards, unlock rewards, and make sustainable commuting fun and engaging."
            />
            <FeatureCard 
              icon={<Car className="w-6 h-6" />}
              title="Flexible Options"
              description="Whether you drive or ride, choose car or bike, and find the perfect match for your schedule."
            />
            <FeatureCard 
              icon={<Sprout className="w-6 h-6" />}
              title="Cost Savings"
              description="Split fuel costs fairly, reduce vehicle maintenance, and save money while reducing your carbon footprint."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-emerald-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 mb-8">
            Join thousands of colleagues already making a difference
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-10 py-3.5 bg-white text-emerald-900 rounded-lg hover:bg-emerald-50 transition-all font-semibold text-base shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
