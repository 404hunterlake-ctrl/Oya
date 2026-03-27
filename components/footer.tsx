import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Oya</h3>
            <p className="text-sm">
              The fastest way to find verified professionals in Nigeria. From plumbing to tutoring, we&apos;ve got you covered.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">For Clients</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/client" className="hover:text-white transition-colors">Find a Sabi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Safety & Trust</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing Guide</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">For Sabis</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sabi" className="hover:text-white transition-colors">Become a Sabi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sabi Guidelines</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Community Forum</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Oya Service Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
