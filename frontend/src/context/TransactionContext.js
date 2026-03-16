import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, page: 1, pages: 1 });
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(false);

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await api.get('/transactions/summary');
      setSummary(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  const addTransaction = useCallback(async (payload) => {
    try {
      const { data } = await api.post('/transactions', payload);
      setTransactions((prev) => [data, ...prev]);
      setSummary(null); // invalidate summary
      toast.success('Transaction added!');
      return data;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    }
  }, []);

  const updateTransaction = useCallback(async (id, payload) => {
    try {
      const { data } = await api.put(`/transactions/${id}`, payload);
      setTransactions((prev) => prev.map((t) => (t._id === id ? data : t)));
      setSummary(null);
      toast.success('Transaction updated!');
      return data;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      setSummary(null);
      toast.success('Transaction deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  return (
    <TransactionContext.Provider value={{
      transactions, pagination, summary, loading,
      fetchTransactions, fetchSummary,
      addTransaction, updateTransaction, deleteTransaction,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
