import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Heart, Users, FileText, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <Heart className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          ASHAsathi
        </h1>
        
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          Offline-first digital health record companion for ASHA workers and PHC staff in rural India
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Patient Management</h3>
            <p className="text-sm text-muted-foreground">
              Register and track patients with offline-first storage
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Visit Records</h3>
            <p className="text-sm text-muted-foreground">
              Document visits with vitals and geo-tagged locations
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">Auto-Sync</h3>
            <p className="text-sm text-muted-foreground">
              Automatically sync data when internet is available
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>ASHAsathi - Empowering rural healthcare workers</p>
      </footer>
    </div>
  );
};

export default Index;
