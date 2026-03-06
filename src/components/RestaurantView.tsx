"use client";

import { motion } from "framer-motion";
import { useGameState, CustomerStatus } from "@/hooks/useGameState";
import CustomerComponent from "./Customer";
import { Utensils, DollarSign, ChefHat } from "lucide-react";
import Image from "next/image";

import KitchenView from "./KitchenView";
import { useState } from "react";

export default function RestaurantView() {
  const { customers, money, level, updateCustomerStatus, addCustomer, completeOrder, inventory, setInventory } = useGameState();
  const [activeView, setActiveView] = useState<"dining" | "kitchen">("dining");

  const handleCustomerClick = (id: string, status: CustomerStatus) => {
    if (status === "ordering") {
      updateCustomerStatus(id, "waiting");
      // Simulate ordering
    } else if (status === "paying") {
      completeOrder(id, 25);
    }
  };

  const handleCookComplete = (dishId: string) => {
    setInventory(prev => [...prev, dishId]);
    setActiveView("dining");
  };

  const spawnCustomer = () => {
    const id = Math.random().toString(36).substr(2, 9);
    addCustomer({
      id,
      variant: Math.floor(Math.random() * 3) + 1,
      status: "ordering",
      tableId: 1
    });
  };

  if (activeView === "kitchen") {
    return <KitchenView onBack={() => setActiveView("dining")} onCookComplete={handleCookComplete} />;
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden" style={{ background: '#0f172a' }}>
      {/* Background */}
      <Image 
        src="/assets/restaurant_background.png" 
        alt="Restaurant" 
        fill 
        style={{ objectFit: 'cover', opacity: 0.4 }}
      />

      {/* HUD */}
      <div className="fixed top-6 left-6 right-6 flex justify-between items-center z-50">
        <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ChefHat color="var(--primary)" />
          <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>LEVEL {level}</span>
        </div>

        <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <DollarSign color="#22c55e" />
          <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>${money}</span>
        </div>
      </div>

      {/* Inventory */}
      <div className="fixed top-24 right-6 flex flex-col gap-2 z-50">
        {inventory.map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={16} /> 1x {item}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="h-full flex flex-col items-center justify-center relative z-10">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem' }}>
          {customers.map(customer => (
            <CustomerComponent 
              key={customer.id} 
              customer={customer} 
              onClick={(id, status) => {
                if (status === "waiting" && inventory.includes("burger")) {
                    setInventory(prev => {
                        const next = [...prev];
                        next.splice(next.indexOf("burger"), 1);
                        return next;
                    });
                    updateCustomerStatus(id, "eating");
                    setTimeout(() => updateCustomerStatus(id, "paying"), 3000);
                } else {
                    handleCustomerClick(id, status);
                }
              }} 
            />
          ))}

          {customers.length === 0 && (
            <button 
              onClick={spawnCustomer}
              className="btn-premium"
              style={{ gridColumn: 'span 3', justifySelf: 'center' }}
            >
              SPAWN CUSTOMER
            </button>
          )}
        </div>
      </div>

      {/* Footer / Kitchen Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button 
          onClick={() => setActiveView("dining")}
          className="btn-premium" 
          style={{ background: activeView === "dining" ? 'var(--secondary)' : 'var(--card-bg)' }}
        >
          <Utensils size={20} /> DINING AREA
        </button>
        <button 
          onClick={() => setActiveView("kitchen")}
          className="btn-premium" 
          style={{ background: activeView === "kitchen" ? 'var(--secondary)' : 'var(--card-bg)' }}
        >
          <ChefHat size={20} /> KITCHEN
        </button>
      </div>
    </div>
  );
}
