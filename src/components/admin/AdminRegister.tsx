import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lock, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { hasAdmin, register } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasAdmin) {
      navigate('/admin/login');
    }
  }, [hasAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const ok = await register(email, password);
      if (ok) {
        toast.success('Admin account created. You can log in now.');
        navigate('/admin/login');
      } else {
        setError('An admin is already registered');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Registration
          </CardTitle>
          <p className="text-sm text-center text-gray-500">
            Create the first admin account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" disabled={loading} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : (
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Create Admin
                </span>
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/admin/login')} disabled={loading}>
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRegister;
