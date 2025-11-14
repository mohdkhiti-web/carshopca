import { useEffect, useMemo, useState } from 'react';
import { db } from '@/database/indexedDB';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle2, Circle, Mail, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ContactMessageRow {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  questionType?: string;
  subject?: string;
  message: string;
  handled?: boolean;
  handledAt?: Date;
  createdAt?: Date;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [filtered, setFiltered] = useState<ContactMessageRow[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'open' | 'handled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const rows = await db.getContactMessages(500, 0);
        setMessages(rows);
        setFiltered(rows);
      } catch (e) {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let r = messages;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(m =>
        [m.firstName, m.lastName, m.email, m.subject, m.questionType, m.message]
          .filter(Boolean)
          .some(x => String(x).toLowerCase().includes(q))
      );
    }
    if (status === 'open') r = r.filter(m => !m.handled);
    if (status === 'handled') r = r.filter(m => !!m.handled);
    setFiltered(r);
  }, [messages, search, status]);

  const exportCSV = () => {
    const rows = [
      ['ID','Name','Email','Phone','Subject','Type','Message','Handled','CreatedAt','HandledAt'],
      ...filtered.map(m => [
        String(m.id ?? ''),
        `${m.firstName} ${m.lastName}`.trim(),
        m.email,
        m.phone ?? '',
        m.subject ?? '',
        m.questionType ?? '',
        m.message.replace(/\n/g, ' ').slice(0, 500),
        m.handled ? 'Yes' : 'No',
        m.createdAt ? new Date(m.createdAt).toISOString() : '',
        m.handledAt ? new Date(m.handledAt).toISOString() : '',
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contact_messages.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const markHandled = async (id?: number, value?: boolean) => {
    if (!id) return;
    try {
      const res = await db.updateContactMessage(id, { handled: value ?? true });
      if (res) {
        setMessages(prev => prev.map(m => (m.id === id ? res : m)));
        toast.success(value ? 'Marked as handled' : 'Marked as open');
      }
    } catch (e) {
      toast.error('Failed to update message');
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Delete this message?')) return;
    try {
      await db.deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const countOpen = useMemo(() => messages.filter(m => !m.handled).length, [messages]);

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
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500">Open: {countOpen} • Total: {messages.length}</p>
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
                  placeholder="Search messages..."
                  className="pl-10 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="border rounded-md px-2 py-1 text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="handled">Handled</option>
              </select>
              <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {m.handled ? (
                          <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" />Handled</div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600"><Circle className="h-4 w-4" />Open</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{m.firstName} {m.lastName}</div>
                        <div className="text-xs text-gray-500">{m.questionType || 'General'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{m.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{m.subject || '-'}</TableCell>
                      <TableCell className="max-w-[320px] truncate" title={m.message}>{m.message}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {m.handled ? (
                            <Button variant="outline" size="sm" onClick={() => markHandled(m.id, false)}>Mark Open</Button>
                          ) : (
                            <Button size="sm" onClick={() => markHandled(m.id, true)}>Mark Handled</Button>
                          )}
                          <Button variant="destructive" size="icon" onClick={() => remove(m.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No messages found</TableCell>
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

export default AdminMessages;
