"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Customer, CustomerStatus } from "@/hooks/useGameState";

interface CustomerProps {
  customer: Customer;
  onClick: (id: string, status: CustomerStatus) => void;
}

export default function CustomerComponent({ customer, onClick }: CustomerProps) {
  const getStatusText = () => {
    switch (customer.status) {
      case "waiting": return "Waiting...";
      case "ordering": return "Ready to Order!";
      case "eating": return "Eating...";
      case "paying": return "Paid! (Click to Clean)";
      case "cleaning": return "Cleaning...";
      default: return "";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative flex flex-col items-center gap-2 cursor-pointer"
      onClick={() => onClick(customer.id, customer.status)}
      style={{ width: '120px' }}
    >
      <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '12px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '4px' }}>
        {getStatusText()}
      </div>
      
      <div className="relative" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--secondary)' }}>
        <Image 
          src={`/assets/customer_variant_${customer.variant}.png`} 
          alt="Customer" 
          fill 
          style={{ objectFit: 'cover' }}
        />
      </div>

      {customer.order && (
        <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--primary)', padding: '4px', borderRadius: '50%', color: 'white', fontWeight: 'bold' }}>
          !
        </div>
      )}
    </motion.div>
  );
}
