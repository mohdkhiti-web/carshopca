import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, hasAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const success = await login(password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Login
          </CardTitle>
          <p className="text-sm text-center text-gray-500">
            Please enter your admin password to continue
          </p>
        </CardHeader>
        <CardContent>
          {!hasAdmin && (
            <div className="mb-4 p-3 rounded-md bg-blue-50 text-blue-700 text-sm">
              No admin account found. You must register an admin first.
              <Button variant="outline" className="ml-2" onClick={() => navigate('/admin/register')}>
                Create Admin
              </Button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full"
                disabled={loading}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !hasAdmin}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/')} disabled={loading}>
              Back to site
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
