import { useEffect, useMemo, useState } from 'react';
import { db } from '@/database/indexedDB';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Download, Mail, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubscriberRow {
  id?: number;
  email: string;
  createdAt?: Date;
}

const AdminSubscribers = () => {
  const [subs, setSubs] = useState<SubscriberRow[]>([]);
  const [filtered, setFiltered] = useState<SubscriberRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rows = await db.getNewsletterSubscribers(1000, 0);
        setSubs(rows);
        setFiltered(rows);
      } catch (e) {
        toast.error('Failed to load subscribers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!search) return setFiltered(subs);
    const q = search.toLowerCase();
    setFiltered(subs.filter(s => s.email.toLowerCase().includes(q)));
  }, [search, subs]);

  const exportCSV = () => {
    const rows = [
      ['ID','Email','CreatedAt'],
      ...filtered.map(s => [
        String(s.id ?? ''),
        s.email,
        s.createdAt ? new Date(s.createdAt).toISOString() : '',
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subscribers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Remove this subscriber?')) return;
    try {
      await db.deleteNewsletterSubscriber(id);
      setSubs(prev => prev.filter(s => s.id !== id));
      toast.success('Subscriber removed');
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const total = useMemo(() => subs.length, [subs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-500">Total: {total}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search email..."
                  className="pl-10 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2"/>Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{s.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="icon" onClick={() => remove(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">No subscribers</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscribers;
