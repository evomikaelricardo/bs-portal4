import { createContext, useContext, useState, ReactNode } from "react";
import { CustomerService } from "@shared/schema";

interface CustomerContextType {
  customers: CustomerService[];
  setCustomers: (customers: CustomerService[]) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<CustomerService[]>([]);

  return (
    <CustomerContext.Provider value={{ customers, setCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
}
