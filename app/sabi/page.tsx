'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { getJobsForUser, users, sabiProfiles } from '@/lib/db';
import { toast } from 'sonner';

export default function SabiDashboard() {
  // Mocking logged-in Sabi (Ngozi)
  const currentSabiId = 'u2';
  const sabi = users.find(u => u.id === currentSabiId);
  const profile = sabiProfiles.find(p => p.userId === currentSabiId);
  
  const [jobs, setJobs] = useState(getJobsForUser(currentSabiId, 'sabi'));

  const handleStatusChange = (jobId: string, newStatus: 'accepted' | 'cancelled') => {
    setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
    if (newStatus === 'accepted') {
      toast.success('Job Accepted', { description: 'The client has been notified.' });
    } else {
      toast.info('Job Declined', { description: 'The request has been removed from your queue.' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {sabi?.name}</h1>
          <p className="text-gray-500">Manage your jobs and profile.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={profile?.verified ? "default" : "secondary"} className="text-sm py-1">
            {profile?.verified ? 'Verified Sabi' : 'Unverified'}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-gray-500">Rating</div>
            <div className="font-bold">{profile?.rating} ⭐</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="requests">Job Requests</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.filter(j => j.status === 'pending').map(job => (
              <Card key={job.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Client: {users.find(u => u.id === job.clientId)?.name}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      New Request
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{job.description}</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {new Date(job.date).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {new Date(job.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> {users.find(u => u.id === job.clientId)?.location}</div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-500">Estimated Pay</div>
                    <div className="text-xl font-bold text-primary">₦{job.price.toLocaleString()}</div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4 bg-gray-50/50 border-t py-4">
                  <Button className="flex-1" onClick={() => handleStatusChange(job.id, 'accepted')}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Accept
                  </Button>
                  <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusChange(job.id, 'cancelled')}>
                    <XCircle className="mr-2 h-4 w-4" /> Decline
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <h3 className="text-xl font-semibold mt-12 mb-4">Active & Completed Jobs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.filter(j => j.status !== 'pending').map(job => (
              <Card key={job.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <Badge variant={job.status === 'completed' ? 'default' : job.status === 'accepted' ? 'secondary' : 'destructive'}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{new Date(job.date).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-900">₦{job.price.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your skills and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={sabi?.avatar} alt={sabi?.name} />
                  <AvatarFallback>{sabi?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Photo</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md border">{profile?.bio}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
