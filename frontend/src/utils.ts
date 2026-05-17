import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from './types';

export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api';

const fmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' });

export const fmtCurrency = (v: string | number) => fmt.format(Number(v));

export function stockColor(stock: number): string {
  if (stock > 50) return 'var(--accent-green)';
  if (stock > 15) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}

export function rolBadge(rol: string) {
  const map: Record<string, string> = {
    Cajero: 'badge-blue',
    Almacenista: 'badge-purple',
    Gerente: 'badge-green'
  };
  return map[rol] ?? 'badge-amber';
}

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [sql, setSql] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error(`El backend devolvió HTML (probablemente el index.html de Vite/Nginx). Verifica que la URL del API (${url}) sea correcta y el backend esté corriendo.`);
      }

      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const json = await res.json() as ApiResponse<T>;
      setData(json.data);
      setSql(json.sql || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, sql, loading, error, refetch: fetchData };
}
