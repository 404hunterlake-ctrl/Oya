'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menu } from 'lucide-react';
import { toast } from 'sonner';

export function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthOpen(false);
    toast.success(authMode === 'login' ? 'Logged in successfully!' : 'Account created successfully!');
  };

  const navLinks = [
    { href: '/client', label: 'Find a Sabi' },
    { href: '/sabi', label: 'Sabi Dashboard' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Oya</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname.startsWith(link.href)
                      ? 'border-primary text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
              <DialogTrigger render={<Button variant="outline" onClick={() => setAuthMode('login')} />}>
                Log In
              </DialogTrigger>
              <DialogTrigger render={<Button onClick={() => setAuthMode('signup')} />}>
                Sign Up
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{authMode === 'login' ? 'Welcome Back' : 'Create an Account'}</DialogTitle>
                  <DialogDescription>
                    {authMode === 'login' ? 'Enter your details to log in.' : 'Join Oya to find or offer services.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuth} className="space-y-4 mt-4">
                  {authMode === 'signup' && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Chidi Okafor" required />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="chidi@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    {authMode === 'login' ? 'Log In' : 'Sign Up'}
                  </Button>
                  <div className="text-center text-sm text-gray-500 mt-4">
                    {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      type="button" 
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-primary hover:underline font-medium"
                    >
                      {authMode === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Avatar className="h-8 w-8 cursor-pointer border">
              <AvatarImage src="https://picsum.photos/seed/chidi/200/200" alt="User" />
              <AvatarFallback>CO</AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center sm:hidden space-x-4">
            <Avatar className="h-8 w-8 cursor-pointer border">
              <AvatarImage src="https://picsum.photos/seed/chidi/200/200" alt="User" />
              <AvatarFallback>CO</AvatarFallback>
            </Avatar>
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="-mr-2" />}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="text-left mb-6">Menu</SheetTitle>
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium ${
                        pathname.startsWith(link.href) ? 'text-primary' : 'text-gray-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-6 border-t flex flex-col space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => { setIsAuthOpen(true); setAuthMode('login'); }}>
                      Log In
                    </Button>
                    <Button className="w-full justify-start" onClick={() => { setIsAuthOpen(true); setAuthMode('signup'); }}>
                      Sign Up
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
