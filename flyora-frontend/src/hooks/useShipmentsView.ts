import { useEffect, useMemo, useState } from 'react';
import type { ShipmentRecord } from '../types/shipments';

export interface ShipmentFilters {
  search: string;
  trackingNumber: string;
  packageType: string;
  origin: string;
  destination: string;
  shipmentStatus: string;
  dateStart: string;
  dateEnd: string;
  weightRange: string;
  sortBy: string;
}

export const defaultShipmentFilters: ShipmentFilters = {
  search: '',
  trackingNumber: '',
  packageType: '',
  origin: '',
  destination: '',
  shipmentStatus: '',
  dateStart: '',
  dateEnd: '',
  weightRange: '',
  sortBy: 'Newest Pickup',
};

interface Options {
  pageSize?: number;
}

export const useShipmentsView = (shipments: ShipmentRecord[], options: Options = {}) => {
  const pageSize = options.pageSize ?? 6;
  const [filters, setFilters] = useState(defaultShipmentFilters);
  const [page, setPage] = useState(1);

  const filteredShipments = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const matchesWeightRange = (weight: string) => {
      const numericWeight = Number(weight.replace(/[^\d.]/g, ''));
      if (!filters.weightRange) return true;
      if (filters.weightRange === '0-1 KG') return numericWeight <= 1;
      if (filters.weightRange === '1-3 KG') return numericWeight > 1 && numericWeight <= 3;
      if (filters.weightRange === '3-5 KG') return numericWeight > 3 && numericWeight <= 5;
      return numericWeight > 5;
    };

    const filtered = shipments.filter((shipment) => {
      const matchesSearch = !search || [
        shipment.id,
        shipment.trackingNumber,
        shipment.packageName,
        shipment.category,
        shipment.origin,
        shipment.destination,
        shipment.status,
        shipment.senderName,
        shipment.travelerName,
      ].some((value) => String(value).toLowerCase().includes(search));

      const matchesTracking = !filters.trackingNumber || shipment.trackingNumber.toLowerCase().includes(filters.trackingNumber.toLowerCase());
      const matchesPackage = !filters.packageType || shipment.category.toLowerCase().includes(filters.packageType.toLowerCase());
      const matchesOrigin = !filters.origin || shipment.origin.toLowerCase().includes(filters.origin.toLowerCase());
      const matchesDestination = !filters.destination || shipment.destination.toLowerCase().includes(filters.destination.toLowerCase());
      const matchesStatus = !filters.shipmentStatus || shipment.status.toLowerCase().includes(filters.shipmentStatus.toLowerCase());
      const matchesWeight = matchesWeightRange(shipment.weight);

      const pickupDate = new Date(shipment.pickupDate);
      const startDate = filters.dateStart ? new Date(filters.dateStart) : null;
      const endDate = filters.dateEnd ? new Date(filters.dateEnd) : null;
      const matchesStart = !startDate || pickupDate >= startDate;
      const matchesEnd = !endDate || pickupDate <= endDate;

      return matchesSearch && matchesTracking && matchesPackage && matchesOrigin && matchesDestination && matchesStatus && matchesWeight && matchesStart && matchesEnd;
    });

    filtered.sort((left, right) => {
      const leftPickup = new Date(left.pickupDate).getTime();
      const rightPickup = new Date(right.pickupDate).getTime();
      if (filters.sortBy === 'Oldest Pickup') return leftPickup - rightPickup;
      if (filters.sortBy === 'Highest Reward') return right.reward - left.reward;
      if (filters.sortBy === 'Lowest Reward') return left.reward - right.reward;
      if (filters.sortBy === 'Progress High') return right.progress - left.progress;
      if (filters.sortBy === 'Progress Low') return left.progress - right.progress;
      return rightPickup - leftPickup;
    });

    return filtered;
  }, [filters, shipments]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / pageSize));
  const visibleShipments = filteredShipments.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const setFilter = <K extends keyof ShipmentFilters>(key: K, value: ShipmentFilters[K]) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters(defaultShipmentFilters);
  };

  return {
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
    totalPages,
    visibleShipments,
    filteredShipments,
  };
};
