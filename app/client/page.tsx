'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react';
import { getSabis } from '@/lib/db';
import Link from 'next/link';

export default function ClientDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const sabis = getSabis();

  const filteredSabis = sabis.filter(sabi => 
    sabi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sabi.profile?.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Sabi</h1>
          <p className="text-gray-500">Search for verified professionals near you.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by name or skill (e.g. Plumbing)" 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSabis.map((sabi) => (
          <Card key={sabi.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar className="h-16 w-16">
                <AvatarImage src={sabi.avatar} alt={sabi.name} />
                <AvatarFallback>{sabi.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{sabi.name}</CardTitle>
                  {sabi.profile?.verified && (
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {sabi.location}
                </div>
                <div className="flex items-center text-sm text-yellow-500 mt-1 font-medium">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {sabi.profile?.rating} ({sabi.profile?.completedJobs} jobs)
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {sabi.profile?.bio}
              </p>
              <div className="flex flex-wrap gap-2">
                {sabi.profile?.skills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between items-center bg-gray-50/50">
              <div className="font-semibold text-primary">
                ₦{sabi.profile?.hourlyRate.toLocaleString()}/hr
              </div>
              <Link href={`/client/book/${sabi.id}`} className={buttonVariants()}>
                Book Now
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredSabis.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No Sabis found matching your search.</p>
        </div>
      )}
    </div>
  );
}
