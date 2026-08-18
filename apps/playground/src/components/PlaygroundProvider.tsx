'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { executeStream, generateRequestId, type HookEvent, type ExecuteResult, type ExecuteError, type ExecuteRequest } from '@/lib/execute-stream';

export interface BigshipCredentials {
  baseURL: string;
  userName: string;
  password: string;
  accessKey: string;
}

export interface HistoryEntry {
  id: string;
  method: string;
  params: unknown[];
  result?: unknown;
  error?: unknown;
  hooks: HookEvent[];
  codeSnippet: string;
  duration: number;
  timestamp: number;
}

interface PlaygroundState {
  credentials: BigshipCredentials | null;
  results: {
    orderIds: string[];
    awbNumbers: string[];
    courierList: Array<{ courier_id: number; courier_name: string }>;
    warehouseIds: number[];
    lrNumbers: string[];
  };
  history: HistoryEntry[];
  hooksLog: HookEvent[];
  isLoading: boolean;
  currentRequestId: string | null;
  hydrated: boolean;
}

export interface MethodResult {
  result?: unknown;
  error?: unknown;
  codeSnippet: string;
  duration: number;
  hooks: HookEvent[];
}

interface PlaygroundContextType extends PlaygroundState {
  setCredentials: (creds: BigshipCredentials | null) => void;
  clearCredentials: () => void;
  executeMethod: (method: string, params: unknown[]) => Promise<MethodResult>;
  addResult: (type: string, value: unknown) => void;
}

const PlaygroundContext = createContext<PlaygroundContextType | null>(null);

const STORAGE_KEY = 'bigship-playground-creds';

function loadCredentials(): BigshipCredentials | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveCredentials(creds: BigshipCredentials | null) {
  if (typeof window === 'undefined') return;
  if (creds) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  // Always initialize with null to match server render (no sessionStorage on server).
  // Hydrate from sessionStorage after mount via useEffect.
  const [credentials, setCredentialsState] = useState<BigshipCredentials | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hooksLog, setHooksLog] = useState<HookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [results, setResults] = useState({
    orderIds: [] as string[],
    awbNumbers: [] as string[],
    courierList: [] as Array<{ courier_id: number; courier_name: string }>,
    warehouseIds: [] as number[],
    lrNumbers: [] as string[],
  });

  useEffect(() => {
    const stored = loadCredentials();
    if (stored) {
      setCredentialsState(stored);
    }
    setHydrated(true);
  }, []);

  const setCredentials = useCallback((creds: BigshipCredentials | null) => {
    setCredentialsState(creds);
    saveCredentials(creds);
  }, []);

  const clearCredentials = useCallback(() => {
    setCredentialsState(null);
    saveCredentials(null);
  }, []);

  const addResult = useCallback((type: string, value: unknown) => {
    setResults(prev => {
      switch (type) {
        case 'orderId':
          return { ...prev, orderIds: [...prev.orderIds, value as string] };
        case 'awb':
          return { ...prev, awbNumbers: [...prev.awbNumbers, value as string] };
        case 'courier':
          return { ...prev, courierList: [...prev.courierList, value as { courier_id: number; courier_name: string }] };
        case 'warehouseId':
          return { ...prev, warehouseIds: [...prev.warehouseIds, value as number] };
        case 'lr':
          return { ...prev, lrNumbers: [...prev.lrNumbers, value as string] };
        default:
          return prev;
      }
    });
  }, []);

  const executeMethod = useCallback(async (method: string, params: unknown[]) => {
    if (!credentials) throw new Error('No credentials set');

    const requestId = generateRequestId();
    setIsLoading(true);
    setCurrentRequestId(requestId);

    const hooks: HookEvent[] = [];
    let resultData: unknown = undefined;
    let errorData: unknown = undefined;
    let codeSnippet = '';
    let duration = 0;

    try {
      await executeStream(
        {
          requestId,
          credentials,
          method,
          params,
        },
        {
          onHook: (event) => {
            hooks.push(event);
            setHooksLog(prev => [...prev.slice(-49), event]);
          },
          onResult: (data) => {
            resultData = data.result;
            codeSnippet = data.codeSnippet;
            duration = data.duration;
          },
          onError: (data) => {
            errorData = data.error;
            codeSnippet = data.codeSnippet;
            duration = data.duration;
          },
          onRateLimit: (retryAfter) => {
            errorData = { name: 'RateLimitError', message: `Rate limited. Retry after ${retryAfter}s` };
          },
        }
      );
    } catch (err) {
      if (!errorData) {
        errorData = { name: 'NetworkError', message: (err as Error).message };
      }
    } finally {
      const entry: HistoryEntry = {
        id: requestId,
        method,
        params,
        result: resultData,
        error: errorData,
        hooks,
        codeSnippet,
        duration,
        timestamp: Date.now(),
      };
      setHistory(prev => [...prev.slice(-19), entry]);
      setIsLoading(false);
      setCurrentRequestId(null);
    }

    return { result: resultData, error: errorData, codeSnippet, duration, hooks };
  }, [credentials]);

  return (
    <PlaygroundContext.Provider
      value={{
        credentials,
        results,
        history,
        hooksLog,
        isLoading,
        currentRequestId,
        hydrated,
        setCredentials,
        clearCredentials,
        executeMethod,
        addResult,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlayground must be used within PlaygroundProvider');
  return ctx;
}
