'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, ShieldAlert, Users, Briefcase, Activity } from 'lucide-react';
import { getAllUsers, sabiProfiles, jobs } from '@/lib/db';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [users, setUsers] = useState(getAllUsers());
  const [profiles, setProfiles] = useState(sabiProfiles);

  const handleVerify = (userId: string) => {
    setProfiles(profiles.map(p => p.userId === userId ? { ...p, verified: true } : p));
    toast.success('Sabi Verified', { description: 'The user has been granted verified status.' });
  };

  const handleRevoke = (userId: string) => {
    setProfiles(profiles.map(p => p.userId === userId ? { ...p, verified: false } : p));
    toast.warning('Verification Revoked', { description: 'The user has lost verified status.' });
  };

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
                    const profile = profiles.find(p => p.userId === sabi.id);
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
