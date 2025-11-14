import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CarDocument } from '../../types/Car';
import { createCar, updateCar, getCar } from '../../services/api';

type CarFormProps = {
  isEdit?: boolean;
};

const CarForm = ({ isEdit = false }: CarFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Omit<CarDocument, '_id' | 'createdAt' | 'updatedAt'>>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: '',
    description: '',
    features: [],
    images: [],
    isFeatured: false,
    isSold: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const fetchCar = async () => {
        try {
          setLoading(true);
          const car = await getCar(id);
          if (car) {
            setFormData(car);
            setImageUrls(car.images || []);
          }
        } catch (err) {
          setError('Failed to fetch car details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCar();
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' 
        ? Number(value) 
        : type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value
    }));
  };

  const handleImageUrlAdd = () => {
    const url = (document.getElementById('imageUrl') as HTMLInputElement)?.value?.trim();
    if (url && !imageUrls.includes(url)) {
      setImageUrls([...imageUrls, url]);
      (document.getElementById('imageUrl') as HTMLInputElement).value = '';
    }
  };

  const handleImageUrlRemove = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter(url => url !== urlToRemove));
  };

  const handleFeatureAdd = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleFeatureRemove = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const carData = {
        ...formData,
        images: imageUrls,
        price: Number(formData.price),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        isFeatured: formData.isFeatured,
        isSold: formData.isSold,
        features: formData.features,
        color: formData.color,
        description: formData.description,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        brand: formData.brand,
        model: formData.model
      };

      if (isEdit && id) {
        await updateCar(id, carData);
      } else {
        await createCar(carData);
      }
      
      navigate('/admin/cars');
    } catch (err) {
      setError('Failed to save car. Please try again.');
      console.error('Error saving car:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Car' : 'Add New Car'}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Year *</label>
              <input
                type="number"
                name="year"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Additional Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Mileage (miles)</label>
              <input
                type="number"
                name="mileage"
                min="0"
                value={formData.mileage}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Transmission</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              id="imageUrl"
              placeholder="Enter image URL"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleImageUrlAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Car ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Features</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Enter a feature"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleFeatureAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Feature
            </button>
          </div>
          
          {formData.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleFeatureRemove(feature)}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 focus:outline-none"
                    aria-label={`Remove ${feature}`}
                  >
                    <span className="sr-only">Remove {feature}</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
              Featured Car
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="isSold"
              name="isSold"
              type="checkbox"
              checked={formData.isSold}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isSold" className="ml-2 block text-sm text-gray-700">
              Mark as Sold
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Car' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarForm;
