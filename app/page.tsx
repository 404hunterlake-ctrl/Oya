'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wrench, Sparkles, BookOpen, ShieldCheck, Clock, CreditCard, Search, CalendarCheck, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-4">
          Now available in Lagos & Abuja
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
          Get it done with <span className="text-primary">Oya</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The fastest way to find verified professionals in Nigeria. From plumbing to tutoring, we&apos;ve got you covered.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/client" className={buttonVariants({ size: "lg", className: "text-lg px-8" })}>
            Find a Sabi
          </Link>
          <Link href="/sabi" className={buttonVariants({ variant: "outline", size: "lg", className: "text-lg px-8" })}>
            Become a Sabi
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">How Oya Works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Three simple steps to get your tasks completed by professionals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          
          <div className="text-center space-y-4 bg-gray-50 p-6 rounded-2xl md:bg-transparent md:p-0">
            <div className="bg-white border-4 border-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">1. Find a Sabi</h3>
            <p className="text-gray-600">Search for the service you need and browse verified professionals near you.</p>
          </div>
          
          <div className="text-center space-y-4 bg-gray-50 p-6 rounded-2xl md:bg-transparent md:p-0">
            <div className="bg-white border-4 border-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CalendarCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">2. Book & Pay</h3>
            <p className="text-gray-600">Select a time that works for you and pay securely through the platform.</p>
          </div>
          
          <div className="text-center space-y-4 bg-gray-50 p-6 rounded-2xl md:bg-transparent md:p-0">
            <div className="bg-white border-4 border-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">3. Get it Done</h3>
            <p className="text-gray-600">The Sabi arrives and completes the job. Rate your experience afterwards.</p>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Popular Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Plumbing</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-500">
              Fix leaks, install pipes, and general repairs.
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Cleaning</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-500">
              Home, office, and post-construction cleaning.
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Tutoring</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-500">
              Math, Science, Languages, and Exam Prep.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Oya */}
      <section className="bg-gray-900 text-white rounded-[2.5rem] p-8 md:p-16 shadow-xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose Oya?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">We&apos;re building trust in the Nigerian service industry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Verified Sabis</h3>
            <p className="text-gray-400">Every professional is vetted, identity-checked, and verified for your safety.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold">On-Demand</h3>
            <p className="text-gray-400">Need it done now? Find available Sabis ready to work immediately.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Secure Payments</h3>
            <p className="text-gray-400">Pay securely through the app. Funds are held until the job is completed.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center">What Nigerians are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-primary/5 border-none shadow-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex text-yellow-500">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg text-gray-700 italic">&quot;Oya saved me when my pipe burst on a Sunday morning. Found a plumber in 10 minutes and he was at my house in Lekki within an hour.&quot;</p>
              <div className="flex items-center gap-3 pt-4">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/ade/100/100" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Adeola F.</div>
                  <div className="text-sm text-gray-500">Client in Lagos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-none shadow-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex text-yellow-500">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg text-gray-700 italic">&quot;Since I joined Oya as a Sabi, I don&apos;t have to hustle for clients anymore. The app brings jobs straight to my phone. It&apos;s been a game changer.&quot;</p>
              <div className="flex items-center gap-3 pt-4">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/musa/100/100" />
                  <AvatarFallback>MU</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Musa I.</div>
                  <div className="text-sm text-gray-500">Electrician in Abuja</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
