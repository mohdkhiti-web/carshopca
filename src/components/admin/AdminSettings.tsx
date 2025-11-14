import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { db } from '@/database/indexedDB';

const AdminSettings = () => {
  const { updatePassword } = useAdminAuth();
  const [email, setEmail] = useState<string>('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const admin = await db.getAdmin();
      if (admin?.email) setEmail(admin.email);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) {
      toast.error('Fill all fields');
      return;
    }
    if (next.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (next !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const ok = await updatePassword(current, next);
      if (ok) {
        toast.success('Password updated');
        setCurrent('');
        setNext('');
        setConfirm('');
      } else {
        toast.error('Wrong current password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-sm text-gray-500">Manage your account</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <Input value={email} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Current Password</label>
                <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">New Password</label>
                  <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Confirm Password</label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
