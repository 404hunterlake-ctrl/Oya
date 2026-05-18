'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menu, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logout,
  type User,
} from '@/lib/db';

export function Navbar() {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'sabi'>('client');

  // Load current user on mount
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const user = await getCurrentUser();
    setCurrentUser(user);
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        const result = await loginUser({ email, password });
        setCurrentUser(result.user);
        toast.success('Logged in successfully!');
      } else {
        const result = await registerUser({
          name,
          email,
          password,
          role,
        });
        setCurrentUser(result.user);
        toast.success('Account created successfully!');
      }
      setIsAuthOpen(false);
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('client');
    setAuthError(null);
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setAuthError(null);
  };

  const navLinks = [
    { href: '/client', label: 'Find a Sabi' },
    { href: '/sabi', label: 'Sabi Dashboard' },
    ...(currentUser?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  const userInitials = currentUser?.name
    ? currentUser.name.substring(0, 2).toUpperCase()
    : 'U';

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
            {currentUser ? (
              <>
                <span className="text-sm text-gray-600">
                  {currentUser.name}
                </span>
                <Avatar className="h-8 w-8 cursor-pointer border">
                  <AvatarImage src={currentUser.avatar || ''} alt={currentUser.name} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Log Out
                </Button>
              </>
            ) : (
              <Dialog open={isAuthOpen} onOpenChange={(open) => { setIsAuthOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger render={<Button variant="outline" onClick={() => { setAuthMode('login'); resetForm(); }} />}>
                  Log In
                </DialogTrigger>
                <DialogTrigger render={<Button onClick={() => { setAuthMode('signup'); resetForm(); }} />}>
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
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Chidi Okafor"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">I want to</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="role"
                                value="client"
                                checked={role === 'client'}
                                onChange={() => setRole('client')}
                                className="accent-primary"
                              />
                              <span className="text-sm">Find a Sabi</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="role"
                                value="sabi"
                                checked={role === 'sabi'}
                                onChange={() => setRole('sabi')}
                                className="accent-primary"
                              />
                              <span className="text-sm">Become a Sabi</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="chidi@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    {authError && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {authError}
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading
                        ? 'Please wait...'
                        : authMode === 'login'
                        ? 'Log In'
                        : 'Sign Up'}
                    </Button>
                    <div className="text-center text-sm text-gray-500 mt-4">
                      {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                      <button 
                        type="button" 
                        onClick={switchMode}
                        className="text-primary hover:underline font-medium"
                      >
                        {authMode === 'login' ? 'Sign Up' : 'Log In'}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center sm:hidden space-x-4">
            {currentUser ? (
              <>
                <Avatar className="h-8 w-8 cursor-pointer border" onClick={handleLogout}>
                  <AvatarImage src={currentUser.avatar || ''} alt={currentUser.name} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Avatar
                className="h-8 w-8 cursor-pointer border"
                onClick={() => { setIsAuthOpen(true); setAuthMode('login'); resetForm(); }}
              >
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            )}
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
                    {currentUser ? (
                      <>
                        <div className="text-sm text-gray-600 px-4">
                          Signed in as <strong>{currentUser.name}</strong>
                        </div>
                        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" /> Log Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full justify-start" onClick={() => { setIsAuthOpen(true); setAuthMode('login'); resetForm(); }}>
                          Log In
                        </Button>
                        <Button className="w-full justify-start" onClick={() => { setIsAuthOpen(true); setAuthMode('signup'); resetForm(); }}>
                          Sign Up
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Auth Dialog */}
      <Dialog open={isAuthOpen} onOpenChange={(open) => { setIsAuthOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{authMode === 'login' ? 'Welcome Back' : 'Create an Account'}</DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'Enter your details to log in.' : 'Join Oya to find or offer services.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAuth} className="space-y-4 mt-4">
            {authMode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="m-name">Full Name</Label>
                  <Input
                    id="m-name"
                    placeholder="Chidi Okafor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-role">I want to</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="m-role"
                        value="client"
                        checked={role === 'client'}
                        onChange={() => setRole('client')}
                        className="accent-primary"
                      />
                      <span className="text-sm">Find a Sabi</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="m-role"
                        value="sabi"
                        checked={role === 'sabi'}
                        onChange={() => setRole('sabi')}
                        className="accent-primary"
                      />
                      <span className="text-sm">Become a Sabi</span>
                    </label>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="m-email">Email</Label>
              <Input
                id="m-email"
                type="email"
                placeholder="chidi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-password">Password</Label>
              <Input
                id="m-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {authError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {authError}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? 'Please wait...'
                : authMode === 'login'
                ? 'Log In'
                : 'Sign Up'}
            </Button>
            <div className="text-center text-sm text-gray-500 mt-4">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-primary hover:underline font-medium"
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
