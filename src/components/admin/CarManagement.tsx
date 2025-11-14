import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2, Plus, Search, Car } from 'lucide-react';
import { db, type Car as DBCar } from '../../database/indexedDB';
import { formatCurrency, formatKm } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { Checkbox } from '../ui/checkbox';

const CarManagement = () => {
  const [cars, setCars] = useState<DBCar[]>([]);
  const [filteredCars, setFilteredCars] = useState<DBCar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    let filtered = cars;
    // search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.year.toString().includes(searchTerm) ||
          car.price.toString().includes(searchTerm)
      );
    }
    // status filter
    if (statusFilter === 'available') filtered = filtered.filter(c => !c.isSold);
    if (statusFilter === 'sold') filtered = filtered.filter(c => !!c.isSold);
    setFilteredCars(filtered);
  }, [searchTerm, cars, statusFilter]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const allCars = await db.getCars(100, 0); // Get first 100 cars
      setCars(allCars);
      setFilteredCars(allCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Brand','Model','Year','Price','Mileage','Featured','Sold','CreatedAt','UpdatedAt'],
      ...filteredCars.map(c => [
        String(c.id ?? ''),
        c.brand,
        c.model,
        String(c.year),
        String(c.price),
        String(c.mileage),
        c.featured ? 'Yes' : 'No',
        c.isSold ? 'Yes' : 'No',
        c.createdAt ? new Date(c.createdAt).toISOString() : '',
        c.updatedAt ? new Date(c.updatedAt).toISOString() : '',
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cars.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await db.deleteCar(id);
        toast.success('Car deleted successfully');
        fetchCars(); // Refresh the list
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('Failed to delete car');
      }
    }
  };

  

  const updateRow = (updated: DBCar) => {
    setCars(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setFilteredCars(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const handleToggleFeatured = async (car: DBCar, value: boolean) => {
    if (!car.id) return;
    try {
      const res = await db.updateCar(car.id, { featured: value });
      if (res) {
        updateRow(res);
        toast.success(`Marked as ${value ? 'Featured' : 'Standard'}`);
      }
    } catch (e) {
      toast.error('Failed to update featured');
    }
  };

  const handleToggleSold = async (car: DBCar, value: boolean) => {
    if (!car.id) return;
    try {
      const res = await db.updateCar(car.id, { isSold: value, soldAt: value ? new Date() : undefined });
      if (res) {
        updateRow(res);
        toast.success(value ? 'Marked as Sold' : 'Marked as Available');
      }
    } catch (e) {
      toast.error('Failed to update sold status');
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Cars</h1>
          <p className="text-gray-500">View and manage all cars in the inventory</p>
        </div>
        <Button onClick={() => navigate('/admin/cars/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Car
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search cars..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border rounded-md px-2 py-1 text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
              <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {filteredCars.length} {filteredCars.length === 1 ? 'car' : 'cars'} found
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCars.length > 0 ? (
                  filteredCars.map((car, i) => (
                    <TableRow key={car.id ?? `${car.brand}-${car.model}-${car.year}-${i}`}>
                      <TableCell className="py-2">
                        <div className="h-12 w-16 overflow-hidden rounded-md">
                          <img
                            src={car.image || 'https://via.placeholder.com/80x60'}
                            alt={`${car.brand} ${car.model}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            sizes="64px"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{car.brand} {car.model}</div>
                        <div className="text-sm text-gray-500">{car.color || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{formatCurrency(car.price)}</TableCell>
                      <TableCell>{formatKm(car.mileage)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={!!car.featured}
                            onCheckedChange={(v) => handleToggleFeatured(car, Boolean(v))}
                            aria-label="Toggle Featured"
                          />
                          <span className="text-xs">{car.featured ? 'Featured' : 'Standard'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={!!car.isSold}
                            onCheckedChange={(v) => handleToggleSold(car, Boolean(v))}
                            aria-label="Toggle Sold"
                          />
                          <span className={`text-xs ${car.isSold ? 'text-red-600' : 'text-green-600'}`}>{car.isSold ? 'Sold' : 'Available'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => car.id && navigate(`/admin/cars/edit/${car.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => car.id && handleDelete(car.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Car className="h-10 w-10 text-gray-400" />
                        <p className="text-gray-500">No cars found</p>
                        <Button 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => navigate('/admin/cars/new')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add your first car
                        </Button>
                      </div>
                    </TableCell>
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

export default CarManagement;
