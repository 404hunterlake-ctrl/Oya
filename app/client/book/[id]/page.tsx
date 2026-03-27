'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, ShieldCheck, Star } from 'lucide-react';
import { getSabis } from '@/lib/db';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BookSabi({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const sabis = getSabis();
  const sabi = sabis.find(s => s.id === resolvedParams.id);

  if (!sabi) {
    return <div className="text-center py-12">Sabi not found.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate booking
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Booking submitted successfully!', {
        description: `${sabi.name} has been notified and will respond shortly.`
      });
      router.push('/client');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/client" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Book {sabi.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={sabi.avatar} alt={sabi.name} />
                <AvatarFallback>{sabi.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="flex justify-center items-center gap-2">
                {sabi.name}
                {sabi.profile?.verified && <ShieldCheck className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <div className="flex justify-center items-center text-sm text-yellow-500 mt-1 font-medium">
                <Star className="h-4 w-4 mr-1 fill-current" />
                {sabi.profile?.rating} ({sabi.profile?.completedJobs} jobs)
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                {sabi.location}
              </div>
              <div className="flex flex-wrap gap-2">
                {sabi.profile?.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500">Hourly Rate</div>
                <div className="text-xl font-bold text-primary">₦{sabi.profile?.hourlyRate.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Provide details about the service you need.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" placeholder="e.g. Fix leaking kitchen sink" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the problem or task in detail..." 
                    className="min-h-[120px]"
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="date" type="date" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="time" type="time" className="pl-10" required />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Service Address</Label>
                  <Input id="address" placeholder="Full address where service is needed" required />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 border-t flex justify-end py-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Request Booking'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
