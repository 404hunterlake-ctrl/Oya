'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { getJobs, getCurrentUser, acceptJob, updateJobStatus, type User, type SabiProfile, type Job } from '@/lib/db';
import { toast } from 'sonner';

export default function SabiDashboard() {
  const [currentUser, setCurrentUser] = useState<User & { sabiProfile?: SabiProfile | null } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user && user.role === 'sabi') {
        const jobsData = await getJobs(user.id, 'sabi');
        setJobs(jobsData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: 'accepted' | 'cancelled') => {
    try {
      if (newStatus === 'accepted') {
        await acceptJob(jobId);
        toast.success('Job Accepted', { description: 'The client has been notified.' });
      } else {
        await updateJobStatus(jobId, 'cancelled');
        toast.info('Job Declined', { description: 'The request has been removed from your queue.' });
      }
      // Refresh jobs
      if (currentUser) {
        const jobsData = await getJobs(currentUser.id, 'sabi');
        setJobs(jobsData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update job';
      toast.error(message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (!currentUser || currentUser.role !== 'sabi') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Sabi Dashboard</h1>
        <p className="text-gray-500 mt-2">Please log in as a Sabi to view your dashboard.</p>
      </div>
    );
  }

  const profile = currentUser.sabiProfile;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser.name}</h1>
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
                        Job ID: {job.id.substring(0, 8)}...
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
                    {job.date && <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {new Date(job.date).toLocaleDateString()}</div>}
                    {job.date && <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {new Date(job.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
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
                    <span>{job.date ? new Date(job.date).toLocaleDateString() : 'No date'}</span>
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
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
