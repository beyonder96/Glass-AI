
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Transaction, ShoppingItem, Pet, ConstructionPhase, ApeNote, WidgetLayoutItem, AppMemory } from '../types';

interface DataContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  shoppingList: ShoppingItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  apePhases: ConstructionPhase[];
  setApePhases: React.Dispatch<React.SetStateAction<ConstructionPhase[]>>;
  apeNotes: ApeNote[];
  setApeNotes: React.Dispatch<React.SetStateAction<ApeNote[]>>;
  dashboardLayout: WidgetLayoutItem[];
  setDashboardLayout: React.Dispatch<React.SetStateAction<WidgetLayoutItem[]>>;
  memory: AppMemory[];
  setMemory: React.Dispatch<React.SetStateAction<AppMemory[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_LAYOUT: WidgetLayoutItem[] = [
  { id: 'w1', type: 'weather', colSpan: 2, isVisible: true },
  { id: 'w2', type: 'ape', colSpan: 1, isVisible: true },
  { id: 'w3', type: 'music', colSpan: 1, isVisible: true },
  { id: 'w4', type: 'maps', colSpan: 2, isVisible: true },
  { id: 'w5', type: 'tasks', colSpan: 1, isVisible: true },
  { id: 'w6', type: 'finance', colSpan: 1, isVisible: true }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [shoppingList, setShoppingListState] = useState<ShoppingItem[]>([]);
  const [pets, setPetsState] = useState<Pet[]>([]);
  const [apePhases, setApePhasesState] = useState<ConstructionPhase[]>([]);
  const [apeNotes, setApeNotesState] = useState<ApeNote[]>([]);
  const [dashboardLayout, setDashboardLayoutState] = useState<WidgetLayoutItem[]>([]);
  const [memory, setMemoryState] = useState<AppMemory[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('glass_tasks');
      const savedTxs = localStorage.getItem('glass_transactions');
      const savedShop = localStorage.getItem('glass_shopping');
      const savedPets = localStorage.getItem('glass_pets');
      const savedApePhases = localStorage.getItem('ape_phases');
      const savedApeNotes = localStorage.getItem('ape_notes');
      const savedLayout = localStorage.getItem('glass_dashboard_layout');
      const savedMemory = localStorage.getItem('glass_memory');

      if (savedTasks) setTasksState(JSON.parse(savedTasks));
      if (savedTxs) setTransactionsState(JSON.parse(savedTxs));
      if (savedShop) setShoppingListState(JSON.parse(savedShop));
      if (savedPets) setPetsState(JSON.parse(savedPets));
      if (savedApePhases) setApePhasesState(JSON.parse(savedApePhases));
      if (savedApeNotes) setApeNotesState(JSON.parse(savedApeNotes));
      if (savedLayout) setDashboardLayoutState(JSON.parse(savedLayout));
      else setDashboardLayoutState(DEFAULT_LAYOUT);
      
      if (savedMemory) setMemoryState(JSON.parse(savedMemory));

      setIsLoaded(true);
    } catch (e) {
      console.error("Erro ao carregar dados locais", e);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('glass_tasks', JSON.stringify(tasks));
      localStorage.setItem('glass_transactions', JSON.stringify(transactions));
      localStorage.setItem('glass_shopping', JSON.stringify(shoppingList));
      localStorage.setItem('glass_pets', JSON.stringify(pets));
      localStorage.setItem('ape_phases', JSON.stringify(apePhases));
      localStorage.setItem('ape_notes', JSON.stringify(apeNotes));
      localStorage.setItem('glass_dashboard_layout', JSON.stringify(dashboardLayout));
      localStorage.setItem('glass_memory', JSON.stringify(memory));
    }
  }, [tasks, transactions, shoppingList, pets, apePhases, apeNotes, dashboardLayout, memory, isLoaded]);

  return (
    <DataContext.Provider value={{ 
      tasks, setTasks: setTasksState, 
      transactions, setTransactions: setTransactionsState, 
      shoppingList, setShoppingList: setShoppingListState,
      pets, setPets: setPetsState,
      apePhases, setApePhases: setApePhasesState,
      apeNotes, setApeNotes: setApeNotesState,
      dashboardLayout, setDashboardLayout: setDashboardLayoutState,
      memory, setMemory: setMemoryState
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
