"use client";

import { useState, useCallback } from "react";

export type GameMode = "level" | "guided" | "custom";
export type CustomerStatus = "waiting" | "ordering" | "eating" | "paying" | "cleaning";

export interface Order {
  dishId: string;
  ingredients: string[];
  status: "pending" | "preparing" | "ready" | "served";
}

export interface Customer {
  id: string;
  variant: number;
  status: CustomerStatus;
  order?: Order;
  tableId: number;
}

export function useGameState() {
  const [level, setLevel] = useState(1);
  const [money, setMoney] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  
  const addCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  }, []);

  const updateCustomerStatus = useCallback((id: string, status: CustomerStatus) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }, []);

  const completeOrder = useCallback((id: string, payment: number) => {
    setMoney(prev => prev + payment);
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    level,
    money,
    customers,
    inventory,
    addCustomer,
    updateCustomerStatus,
    completeOrder,
    setLevel,
    setMoney,
    setInventory
  };
}
