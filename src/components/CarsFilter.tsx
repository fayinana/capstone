
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { carBrands, fuelTypes, locations, transmissionTypes } from '@/data/constants';
import { Search, MapPin, Car, Fuel, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  location: z.string().optional(),
  brand: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
});

type FilterFormValues = z.infer<typeof formSchema>;

interface CarsFilterProps {
  initialValues?: {
    location?: string;
    brand?: string;
    fuelType?: string;
    transmission?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  className?: string;
}

const CarsFilter: React.FC<CarsFilterProps> = ({ initialValues = {}, className }) => {
  const navigate = useNavigate();
  
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialValues.location || '',
      brand: initialValues.brand || '',
      fuelType: initialValues.fuelType || '',
      transmission: initialValues.transmission || '',
    },
  });

  const onSubmit = (values: FilterFormValues) => {
    const searchParams = new URLSearchParams();
    
    if (values.location && values.location !== 'all') searchParams.append('location', values.location);
    if (values.brand && values.brand !== 'all') searchParams.append('brand', values.brand);
    if (values.fuelType && values.fuelType !== 'all') searchParams.append('fuelType', values.fuelType);
    if (values.transmission && values.transmission !== 'all') searchParams.append('transmission', values.transmission);
    
    navigate(`/cars?${searchParams.toString()}`);
  };

  const handleReset = () => {
    form.reset({
      location: '',
      brand: '',
      fuelType: '',
      transmission: '',
    });
    navigate('/cars');
  };

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Settings className="mr-2 h-5 w-5 text-yellow-300" /> Filter Options
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-white/70 flex items-center text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
                  Location
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-zinc-800/80 border-yellow-300/10 text-white focus:ring-yellow-300/20 h-9">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-yellow-300/20 text-white">
                      <SelectItem value="all" className="focus:bg-yellow-300/10 focus:text-white">All locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location} className="focus:bg-yellow-300/10 focus:text-white">
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-white/70 flex items-center text-sm">
                  <Car className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
                  Brand
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-zinc-800/80 border-yellow-300/10 text-white focus:ring-yellow-300/20 h-9">
                      <SelectValue placeholder="All brands" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-yellow-300/20 text-white">
                      <SelectItem value="all" className="focus:bg-yellow-300/10 focus:text-white">All brands</SelectItem>
                      {carBrands.map((brand) => (
                        <SelectItem key={brand} value={brand} className="focus:bg-yellow-300/10 focus:text-white">
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-white/70 flex items-center text-sm">
                  <Fuel className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
                  Fuel Type
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-zinc-800/80 border-yellow-300/10 text-white focus:ring-yellow-300/20 h-9">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-yellow-300/20 text-white">
                      <SelectItem value="all" className="focus:bg-yellow-300/10 focus:text-white">All types</SelectItem>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type} className="focus:bg-yellow-300/10 focus:text-white">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-white/70 flex items-center text-sm">
                  <Settings className="h-3.5 w-3.5 mr-1.5 text-yellow-300" />
                  Transmission
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-zinc-800/80 border-yellow-300/10 text-white focus:ring-yellow-300/20 h-9">
                      <SelectValue placeholder="All transmissions" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-yellow-300/20 text-white">
                      <SelectItem value="all" className="focus:bg-yellow-300/10 focus:text-white">All transmissions</SelectItem>
                      {transmissionTypes.map((type) => (
                        <SelectItem key={type} value={type} className="focus:bg-yellow-300/10 focus:text-white">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-yellow-300 text-black hover:bg-yellow-400"
            >
              <Search className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              className="w-full border-yellow-300/20 text-white hover:bg-yellow-300/10"
            >
              Reset Filters
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CarsFilter;
