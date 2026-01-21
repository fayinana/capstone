import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { locations, carBrands, fuelTypes, transmissionTypes, priceRanges } from '@/data/constants';
import { Search, Calendar, MapPin, Car, Fuel } from 'lucide-react';

const formSchema = z.object({
  location: z.string().optional(),
  brand: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  priceRange: z.string().optional(),
});

type SearchFormValues = z.infer<typeof formSchema>;

interface SearchFormProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

const SearchForm: React.FC<SearchFormProps> = ({ className, variant = 'horizontal' }) => {
  const navigate = useNavigate();
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      brand: '',
      fuelType: '',
      transmission: '',
      priceRange: '',
    },
  });

  const onSubmit = (values: SearchFormValues) => {
    const searchParams = new URLSearchParams();
    
    if (values.location && values.location !== 'all') searchParams.append('location', values.location);
    if (values.brand && values.brand !== 'all') searchParams.append('brand', values.brand);
    if (values.fuelType && values.fuelType !== 'all') searchParams.append('fuelType', values.fuelType);
    if (values.transmission && values.transmission !== 'all') searchParams.append('transmission', values.transmission);
    if (values.priceRange && values.priceRange !== 'all') searchParams.append('priceRange', values.priceRange);
    
    navigate(`/cars?${searchParams.toString()}`);
  };

  const isVertical = variant === 'vertical';

  return (
    <div className={`p-6 rounded-lg shadow-lg ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={`gap-4 ${isVertical ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-5'}`}>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-white/70 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-yellow-300" />
                  Location
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-black/60 border-yellow-300/20 text-white focus:ring-yellow-300/50">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-yellow-300/20 text-white">
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
                <FormLabel className="text-white/70 flex items-center">
                  <Car className="h-4 w-4 mr-2 text-yellow-300" />
                  Brand
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-black/60 border-yellow-300/20 text-white focus:ring-yellow-300/50">
                      <SelectValue placeholder="All brands" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-yellow-300/20 text-white">
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
                <FormLabel className="text-white/70 flex items-center">
                  <Fuel className="h-4 w-4 mr-2 text-yellow-300" />
                  Fuel Type
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-black/60 border-yellow-300/20 text-white focus:ring-yellow-300/50">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-yellow-300/20 text-white">
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
                <FormLabel className="text-white/70 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-yellow-300" />
                  Transmission
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-black/60 border-yellow-300/20 text-white focus:ring-yellow-300/50">
                      <SelectValue placeholder="All transmissions" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-yellow-300/20 text-white">
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
          
          <Button type="submit" className="bg-yellow-300 text-black hover:bg-yellow-400 self-end h-10 mt-auto">
            <Search className="h-4 w-4 mr-2" />
            Search Cars
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SearchForm;
