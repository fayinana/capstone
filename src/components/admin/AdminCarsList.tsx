import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getCars, deleteCar } from "@/api/cars";
import { Car } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Eye, AlertOctagon, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminCarsList = () => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cars", currentPage],
    queryFn: () =>
      getCars({
        page: currentPage,
        limit: carsPerPage,
      }),
  });

  const cars = data?.cars || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / carsPerPage);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({
        title: "Car Deleted",
        description: "The car has been successfully removed.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete car. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  const handleDeleteCar = (car: Car) => {
    setSelectedCar(car);
    setIsDeleteDialogOpen(true);
  };

  const handleEditCar = (carId: string) => {
    navigate(`/admin/cars/edit/${carId}`);
  };

  const confirmDelete = () => {
    if (selectedCar) {
      deleteMutation.mutate(selectedCar.id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-300/10">
        <h2 className="text-xl font-barlow font-semibold mb-4">
          Cars Management
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-16 bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-300/10">
        <div className="flex flex-col items-center justify-center p-6">
          <AlertOctagon className="w-12 h-12 text-yellow-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Cars</h2>
          <p className="text-white/70 mb-4">
            There was an error loading the car data. Please try again.
          </p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["cars"] })
            }
            className="bg-yellow-300 text-black hover:bg-yellow-400"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-yellow-300/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-barlow font-semibold">Cars Management</h2>
        <div className="text-sm text-white/60">
          Total: {totalCount} cars | Page {currentPage} of {totalPages}
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/70 mb-4">
            No cars found. Add your first car to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Car</TableHead>
                  <TableHead className="text-white">Brand/Model</TableHead>
                  <TableHead className="text-white">Price</TableHead>
                  <TableHead className="text-white">Year</TableHead>
                  <TableHead className="text-white">Location</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id} className="border-yellow-300/10">
                    <TableCell>
                      <img
                        src={car.image}
                        alt={car.title || `${car.brand} ${car.model}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {car.title || `${car.brand} ${car.model}`}
                    </TableCell>
                    <TableCell className="text-yellow-300">
                      ${car.price}/day
                    </TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>{car.location}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-yellow-300/50 text-white hover:bg-yellow-300/10"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-zinc-800 border-yellow-300/20 text-white"
                        >
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer hover:bg-yellow-300/10 focus:bg-yellow-300/10"
                            onClick={() => handleEditCar(car.id)}
                          >
                            <Edit className="mr-2 h-4 w-4 text-yellow-300" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10"
                            onClick={() => handleDeleteCar(car)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/cars/${car.id}`}
                              className="flex items-center cursor-pointer hover:bg-white/10 focus:bg-white/10"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-blue-400" />
                              <span>View</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && <PaginationEllipsis />}
                    </>
                  )}

                  {/* Current page and neighbors */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const page = startPage + i;

                    if (page > totalPages) return null;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <PaginationEllipsis />}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border border-yellow-300/20">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete{" "}
              {selectedCar?.title ||
                `${selectedCar?.brand} ${selectedCar?.model}`}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
