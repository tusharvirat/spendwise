import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getErrorMessage, currentMonthKey } from '../utils/helpers';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(false);

  const fetchBudgets = useCallback(async (month = currentMonthKey()) => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets', { params: { month } });
      setBudgets(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBudgetsBulk = useCallback(async (month, budgetList) => {
    try {
      const { data } = await api.post('/budgets/bulk', { month, budgets: budgetList });
      setBudgets(data);
      toast.success('Budgets saved!');
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  }, []);

  const deleteBudget = useCallback(async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets((prev) => prev.filter((b) => b._id !== id));
      toast.success('Budget removed.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  return (
    <BudgetContext.Provider value={{ budgets, loading, fetchBudgets, saveBudgetsBulk, deleteBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudgets = () => useContext(BudgetContext);
