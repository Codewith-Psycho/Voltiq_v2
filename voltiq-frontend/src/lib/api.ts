const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Billing simulation
export interface BillingInput {
  appliances: string[];
  hours: number;
  budget: number;
  comfort: number;
  discom: string;
}

export interface BillingResult {
  baseline: number;
  optimized: number;
  savings: number;
  savingsPercent: number;
  co2Saved: number;
  treesEquivalent: number;
  monthlyData: { month: string; baseline: number; optimized: number }[];
}

export async function simulateBilling(input: BillingInput): Promise<BillingResult> {
  try {
    return await apiFetch<BillingResult>('/billing/simulate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    // Mock fallback for demo
    return {
      baseline: 847,
      optimized: 620,
      savings: 227,
      savingsPercent: 26.8,
      co2Saved: 36.9,
      treesEquivalent: 1.75,
      monthlyData: [
        { month: 'Oct', baseline: 890, optimized: 650 },
        { month: 'Nov', baseline: 850, optimized: 620 },
        { month: 'Dec', baseline: 920, optimized: 680 },
        { month: 'Jan', baseline: 780, optimized: 570 },
        { month: 'Feb', baseline: 847, optimized: 620 },
        { month: 'Mar', baseline: 810, optimized: 590 },
      ],
    };
  }
}
