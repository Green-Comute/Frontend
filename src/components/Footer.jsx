import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-500">
            <Leaf className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span className="text-sm">
              © {new Date().getFullYear()} GreenCommute · Sustainable Mobility Platform
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <span>Built for a greener tomorrow</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  