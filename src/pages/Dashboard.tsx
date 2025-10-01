import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  UserPlus,
  FileText,
  Bell,
  MapPin,
  MessageSquare,
  LogOut,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { offlineStorage } from '@/lib/offlineStorage';
import { requestLocationPermission, requestNotificationPermission } from '@/lib/permissions';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [messagesEnabled, setMessagesEnabled] = useState(
    localStorage.getItem('messages_enabled') === 'true'
  );
  const [stats, setStats] = useState({
    patients: 0,
    visits: 0,
    unsynced: 0,
  });

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    // Online/offline listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load stats
    const patients = offlineStorage.getPatients();
    const visits = offlineStorage.getVisits();
    const unsynced = offlineStorage.getUnsyncedPatients().length + 
                     offlineStorage.getUnsyncedVisits().length;

    setStats({
      patients: patients.length,
      visits: visits.length,
      unsynced,
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleLocationToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await requestLocationPermission();
      if (granted) {
        setLocationEnabled(true);
        toast({
          title: 'Location enabled',
          description: 'GPS tracking is now active for visits.',
        });
      } else {
        toast({
          title: 'Location denied',
          description: 'Please enable location in your browser settings.',
          variant: 'destructive',
        });
      }
    } else {
      setLocationEnabled(false);
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast({
          title: 'Notifications enabled',
          description: 'You will receive reminders and alerts.',
        });
      } else {
        toast({
          title: 'Notifications denied',
          description: 'Please enable notifications in your browser settings.',
          variant: 'destructive',
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleMessagesToggle = (checked: boolean) => {
    setMessagesEnabled(checked);
    localStorage.setItem('messages_enabled', String(checked));
    toast({
      title: checked ? 'Messages enabled' : 'Messages disabled',
      description: checked
        ? 'You will receive SMS notifications.'
        : 'SMS notifications are turned off.',
    });
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: 'No internet connection',
        description: 'Please connect to the internet to sync data.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Syncing...',
      description: 'Uploading unsynced records to cloud.',
    });

    // Simulate sync - you'll implement actual Supabase sync
    setTimeout(() => {
      toast({
        title: 'Sync complete',
        description: 'All records are up to date.',
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">ASHAsathi</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium text-success">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Offline</span>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unsynced Records</CardTitle>
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unsynced}</div>
              {stats.unsynced > 0 && (
                <Button onClick={handleSync} size="sm" className="mt-2 w-full">
                  Sync Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for ASHA workers</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Button
              onClick={() => navigate('/register-patient')}
              className="h-24 flex-col gap-2"
              variant="outline"
            >
              <UserPlus className="h-8 w-8" />
              <span>Register Patient</span>
            </Button>
            <Button
              onClick={() => navigate('/record-visit')}
              className="h-24 flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span>Record Visit</span>
            </Button>
          </CardContent>
        </Card>

        {/* Permissions & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions & Settings</CardTitle>
            <CardDescription>Manage app permissions and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="location">Location Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Track GPS location during visits
                  </p>
                </div>
              </div>
              <Switch
                id="location"
                checked={locationEnabled}
                onCheckedChange={handleLocationToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders and alerts
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="messages">SMS Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Send and receive SMS notifications
                  </p>
                </div>
              </div>
              <Switch
                id="messages"
                checked={messagesEnabled}
                onCheckedChange={handleMessagesToggle}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
