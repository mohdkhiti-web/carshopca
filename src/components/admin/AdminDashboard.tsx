import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Car, Users, BarChart, LogOut, Settings } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { db } from '@/database/indexedDB';
import { formatCurrency } from '@/utils/format';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [stats, setStats] = useState({
    totalCars: 0,
    featuredCars: 0,
    totalVisitors: 0,
    soldCars: 0,
    availableCars: 0,
    totalRevenue: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    monthly: [] as { label: string; count: number; revenue: number }[],
    topBrands: [] as { brand: string; count: number }[],
    subscribers: 0,
    messages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const cars = await db.getCars(1000, 0);
        const totalCars = cars.length;
        const featuredCars = cars.filter((c) => c.featured).length;
        const soldCars = cars.filter((c) => c.isSold).length;
        const availableCars = cars.filter((c) => !c.isSold).length;
        const totalRevenue = cars.filter(c => c.isSold).reduce((sum, c) => sum + (c.price || 0), 0);
        const avgBase = cars.length || 1;
        const averagePrice = Math.round(cars.reduce((sum, c) => sum + (c.price || 0), 0) / avgBase);
        // naive visitors counter in localStorage
        const visitors = Number(localStorage.getItem('siteVisitors') || '0');
        setStats({ totalCars, featuredCars, totalVisitors: visitors, soldCars, availableCars, totalRevenue, averagePrice });

        const subs = await db.getNewsletterSubscribers(1000, 0);
        const msgs = await db.getContactMessages(1000, 0);

        const now = new Date();
        const monthly: { label: string; count: number; revenue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          const label = d.toLocaleString('en-CA', { month: 'short' });
          const monthSold = cars.filter(c => c.isSold && c.soldAt && (new Date(c.soldAt as any)).getFullYear() === y && (new Date(c.soldAt as any)).getMonth() === m);
          const count = monthSold.length;
          const revenue = monthSold.reduce((s, c) => s + (c.price || 0), 0);
          monthly.push({ label, count, revenue });
        }

        const brandMap = new Map<string, number>();
        for (const c of cars) {
          const b = (c.brand || 'Unknown').toString();
          brandMap.set(b, (brandMap.get(b) || 0) + 1);
        }
        const topBrands = Array.from(brandMap.entries())
          .map(([brand, count]) => ({ brand, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setInsights({ monthly, topBrands, subscribers: subs.length, messages: msgs.length });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); 

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
            <Car className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCars}</div>
            <p className="text-xs text-gray-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Cars</CardTitle>
            <Car className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredCars}</div>
            <p className="text-xs text-gray-500">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <BarChart className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.soldCars}</div>
            <p className="text-xs text-gray-500">Available: {stats.availableCars}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-500">Sum of sold cars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <BarChart className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
            <p className="text-xs text-gray-500">Across all cars</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full flex justify-between items-center"
              onClick={() => navigate('/admin/cars/new')}
            >
              <span>Add New Car</span>
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate('/admin/cars')}
            >
              <span>Manage Cars</span>
              <Car className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate('/admin/settings')}
            >
              <span>Account Settings</span>
              <Settings className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <BarChart className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New car added</p>
                  <p className="text-xs text-gray-500">2023 BMW X5 - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New visitor</p>
                  <p className="text-xs text-gray-500">From New York, USA - 5 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Trend (6 mo)</CardTitle>
            <span className="text-xs text-gray-500">{insights.monthly.reduce((s,m)=>s+m.count,0)} sold</span>
          </CardHeader>
          <CardContent>
            <div className="h-28 flex items-end gap-2">
              {insights.monthly.map((m, i) => {
                const max = Math.max(1, ...insights.monthly.map(x => x.count));
                const h = Math.max(4, Math.round((m.count / max) * 100));
                return (
                  <div key={m.label + i} className="flex flex-col items-center">
                    <div className="w-8 bg-red-600 rounded-t" style={{ height: `${h}%` }} title={`${m.label}: ${m.count} • ${formatCurrency(m.revenue)}`}></div>
                    <div className="text-xs mt-1 text-gray-500">{m.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Brands</CardTitle>
            <span className="text-xs text-gray-500">{insights.subscribers} subscribers • {insights.messages} messages</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.topBrands.map((b) => (
                <div key={b.brand} className="flex items-center justify-between">
                  <span className="text-sm">{b.brand}</span>
                  <span className="text-sm text-gray-600">{b.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
