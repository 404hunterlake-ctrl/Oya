'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, ShieldAlert, Users, Briefcase, Activity } from 'lucide-react';
import { getAllUsers, verifySabi, getCurrentUser, getJobs, type User, type SabiProfile, type Job } from '@/lib/db';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [users, setUsers] = useState<(User & { sabiProfile?: SabiProfile | null })[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user?.role === 'admin') {
        const [usersData, jobsData] = await Promise.all([
          getAllUsers(),
          getJobs(),
        ]);
        setUsers(usersData);
        setJobs(jobsData);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleVerify = async (userId: string) => {
    try {
      await verifySabi(userId, true);
      // Refresh user list
      const usersData = await getAllUsers();
      setUsers(usersData);
      toast.success('Sabi Verified', { description: 'The user has been granted verified status.' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify');
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await verifySabi(userId, false);
      // Refresh user list
      const usersData = await getAllUsers();
      setUsers(usersData);
      toast.warning('Verification Revoked', { description: 'The user has lost verified status.' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users, verify Sabis, and monitor platform health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">Uptime this week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sabis" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sabis">Manage Sabis</TabsTrigger>
          <TabsTrigger value="clients">Manage Clients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sabis" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sabi Verification</CardTitle>
              <CardDescription>Verify or revoke Sabi credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.role === 'sabi').map((sabi) => {
                    const profile = sabi.sabiProfile;
                    return (
                      <TableRow key={sabi.id}>
                        <TableCell className="font-medium">{sabi.name}</TableCell>
                        <TableCell>{sabi.email}</TableCell>
                        <TableCell>{sabi.location}</TableCell>
                        <TableCell>
                          {profile?.verified ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Verified</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {profile?.verified ? (
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRevoke(sabi.id)}>
                              <ShieldAlert className="h-4 w-4 mr-2" /> Revoke
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleVerify(sabi.id)}>
                              <ShieldCheck className="h-4 w-4 mr-2" /> Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Client List</CardTitle>
              <CardDescription>View all registered clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.role === 'client').map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
