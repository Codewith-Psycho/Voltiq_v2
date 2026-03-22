# milp/solver.py - VoltIQ MILP Optimization Engine
"""
OR-Tools CBC Solver for appliance scheduling.
Integrates with 4 ML models:
- LFE: Dynamic load cap
- BHV: Soft preference weights
- OPC: Hard outage blocks

Constraints:
1. Dynamic load cap (LFE-powered)
2. Minimum run duration per appliance
3. Geyser ready-by 6 AM
4. WM preferred after 10 PM
5. OPC outage windows: hard block
6. Prepaid balance floor Rs.50
"""

from ortools.linear_solver import pywraplp
import numpy as np
import time
from typing import Dict, List, Optional, Any
from simulator.tariff import UPPCL_TARIFF, get_tariff_slot


# Default appliance configurations for Indian households
DEFAULT_APPLIANCES = [
    {
        'name': 'geyser',
        'power_kw': 2.0,
        'min_hours': 1,
        'ready_by_hour': 6,      # Must complete by 6 AM
        'preferred_after': None
    },
    {
        'name': 'washing_machine',
        'power_kw': 0.5,
        'min_hours': 2,
        'ready_by_hour': None,
        'preferred_after': 22    # Prefer running after 10 PM
    },
    {
        'name': 'ac',
        'power_kw': 1.5,
        'min_hours': 4,
        'ready_by_hour': None,
        'preferred_after': None
    },
]


class MILPSolver:
    """
    MILP Solver for VoltIQ appliance scheduling.
    Uses OR-Tools CBC solver with ML-powered constraints.
    """
    
    def __init__(self):
        self.solver_name = 'CBC'
        self.hours = 24
        
    def solve(
        self,
        appliances: List[Dict] = None,
        balance: float = 247.0,
        lfe_result: Dict = None,
        behavior_probs: Dict = None,
        outage_hours: List[int] = None,
        force_on: Dict[str, int] = None,
        base_load_cap: float = 3.5,
    ) -> Dict[str, Any]:
        """
        Solve appliance scheduling optimization.
        
        Args:
            appliances: List of appliance configs
            balance: Prepaid balance in Rs
            lfe_result: LFE model output {baseline_hourly, p90_hourly, peak_prob_hourly}
            behavior_probs: BHV model output {appliance_name: {hour: prob}}
            outage_hours: OPC blocked hours list
            force_on: Manual overrides {appliance_name: hour}
            base_load_cap: Maximum load in kW (default 3.5)
        
        Returns:
            Optimization result with schedule, costs, savings
        """
        apps = appliances or DEFAULT_APPLIANCES
        t0 = time.time()
        
        # Create solver
        solver = pywraplp.Solver.CreateSolver(self.solver_name)
        if not solver:
            return {'error': 'Solver not available', 'solve_time_ms': 0}
        
        T = self.hours
        n_apps = len(apps)
        
        # Decision variables: x[i,t] = 1 if appliance i is ON at hour t
        x = {
            (i, t): solver.BoolVar(f'x_{i}_{t}')
            for i in range(n_apps)
            for t in range(T)
        }
        
        # === OBJECTIVE: Minimize cost with BHV soft weights ===
        obj = solver.Objective()
        for i, app in enumerate(apps):
            for t in range(T):
                # Base cost = tariff × power
                base_cost = UPPCL_TARIFF[t] * app['power_kw']
                
                # Apply BHV preference weight (reduce cost for preferred hours)
                if behavior_probs and app['name'] in behavior_probs:
                    pref = behavior_probs[app['name']].get(t, 0.5)
                    # Higher preference = lower effective cost (up to 8% discount)
                    cost = base_cost * (1 - pref * 0.08)
                else:
                    cost = base_cost
                
                obj.SetCoefficient(x[i, t], cost)
        
        obj.SetMinimization()
        
        # === CONSTRAINT 1: Dynamic load cap (LFE-powered) ===
        for t in range(T):
            if lfe_result:
                bg = float(lfe_result['baseline_hourly'][t])
                p90 = float(lfe_result['p90_hourly'][t])
                peak_prob = float(lfe_result['peak_prob_hourly'][t])
                
                # Cap = base - background load - P90 risk buffer - spike buffer
                risk_buffer = max(0, p90 - bg)
                spike_buffer = peak_prob * 0.4
                cap = max(0.5, base_load_cap - bg - risk_buffer - spike_buffer)
            else:
                cap = base_load_cap
            
            solver.Add(
                sum(x[i, t] * apps[i]['power_kw'] for i in range(n_apps)) <= cap
            )
        
        # === CONSTRAINT 2-4: Appliance-specific constraints ===
        for i, app in enumerate(apps):
            # C2: Minimum run duration
            solver.Add(
                sum(x[i, t] for t in range(T)) >= app['min_hours']
            )
            
            # C3: Ready-by constraint (e.g., geyser ready by 6 AM)
            if app.get('ready_by_hour'):
                ready_by = app['ready_by_hour']
                solver.Add(
                    sum(x[i, t] for t in range(ready_by)) >= app['min_hours']
                )
            
            # C4: Preferred-after constraint (e.g., WM after 10 PM)
            if app.get('preferred_after'):
                pref_after = app['preferred_after']
                for t in range(pref_after):
                    solver.Add(x[i, t] == 0)
        
        # === CONSTRAINT 5: OPC outage hard blocks ===
        if outage_hours:
            for t in outage_hours:
                if 0 <= t < T:
                    for i in range(n_apps):
                        solver.Add(x[i, t] == 0)
        
        # === CONSTRAINT 6: Prepaid balance floor (Rs. 50 minimum) ===
        total_cost_expr = sum(
            UPPCL_TARIFF[t] * apps[i]['power_kw'] * x[i, t]
            for i in range(n_apps)
            for t in range(T)
        )
        solver.Add(total_cost_expr <= balance - 50)
        
        # === CONSTRAINT 7: Force ON (manual overrides) ===
        if force_on:
            for app_name, hour in force_on.items():
                for i, app in enumerate(apps):
                    if app['name'] == app_name and 0 <= hour < T:
                        solver.Add(x[i, hour] == 1)
        
        # === SOLVE ===
        status = solver.Solve()
        solve_time_ms = round((time.time() - t0) * 1000, 1)
        
        if status != pywraplp.Solver.OPTIMAL:
            return {
                'error': 'No optimal solution found',
                'status': self._status_name(status),
                'solve_time_ms': solve_time_ms
            }
        
        # === BUILD RESULT ===
        schedule = []
        total_cost = 0.0
        
        for i, app in enumerate(apps):
            for t in range(T):
                if x[i, t].solution_value() > 0.5:
                    cost = UPPCL_TARIFF[t] * app['power_kw']
                    total_cost += cost
                    tariff_info = get_tariff_slot(t)
                    
                    schedule.append({
                        'appliance': app['name'],
                        'hour': t,
                        'time_label': f'{t:02d}:00',
                        'cost_rs': round(cost, 2),
                        'tariff_rate': UPPCL_TARIFF[t],
                        'tariff_slot': tariff_info['slot'],
                        'slot_color': tariff_info['color'],
                        'power_kw': app['power_kw']
                    })
        
        # Calculate baseline (worst case: all at peak rate Rs. 9.1)
        baseline_cost = sum(9.1 * app['power_kw'] * app['min_hours'] for app in apps)
        savings_rs = baseline_cost - total_cost
        savings_pct = (savings_rs / baseline_cost * 100) if baseline_cost > 0 else 0
        
        return {
            'schedule': sorted(schedule, key=lambda x: (x['hour'], x['appliance'])),
            'total_cost': round(total_cost, 2),
            'baseline_cost': round(baseline_cost, 2),
            'savings_rs': round(savings_rs, 2),
            'savings_pct': round(savings_pct, 1),
            'solve_time_ms': solve_time_ms,
            'pipeline': 'LFE→BHV→OPC→MILP',
            'constraints_met': {
                'load_cap': True,
                'min_duration': True,
                'ready_by': True,
                'preferred_after': True,
                'outage_blocked': bool(outage_hours),
                'prepaid_floor': True
            },
            'appliances_scheduled': len(set(s['appliance'] for s in schedule)),
            'hours_scheduled': len(schedule)
        }
    
    def _status_name(self, status: int) -> str:
        """Convert solver status to readable name"""
        status_map = {
            pywraplp.Solver.OPTIMAL: 'OPTIMAL',
            pywraplp.Solver.FEASIBLE: 'FEASIBLE',
            pywraplp.Solver.INFEASIBLE: 'INFEASIBLE',
            pywraplp.Solver.UNBOUNDED: 'UNBOUNDED',
            pywraplp.Solver.ABNORMAL: 'ABNORMAL',
            pywraplp.Solver.NOT_SOLVED: 'NOT_SOLVED',
        }
        return status_map.get(status, 'UNKNOWN')


def solve_with_ml(
    appliances: List[Dict] = None,
    balance: float = 247.0,
    lfe_baseline: List[float] = None,
    lfe_p90: List[float] = None,
    lfe_peak_prob: List[float] = None,
    behavior_probs: Dict = None,
    outage_windows: List[int] = None,
    force_on: Dict[str, int] = None,
) -> Dict[str, Any]:
    """
    Convenience function matching original API.
    Wraps MILPSolver for backward compatibility.
    """
    # Build LFE result dict if individual arrays provided
    lfe_result = None
    if lfe_baseline and lfe_p90 and lfe_peak_prob:
        lfe_result = {
            'baseline_hourly': lfe_baseline,
            'p90_hourly': lfe_p90,
            'peak_prob_hourly': lfe_peak_prob
        }
    
    solver = MILPSolver()
    return solver.solve(
        appliances=appliances,
        balance=balance,
        lfe_result=lfe_result,
        behavior_probs=behavior_probs,
        outage_hours=outage_windows,
        force_on=force_on
    )


# Quick test function
def test_solver():
    """Test MILP solver with dummy data"""
    result = solve_with_ml(
        appliances=DEFAULT_APPLIANCES,
        balance=300.0,
        lfe_baseline=[0.8] * 24,
        lfe_p90=[1.2] * 24,
        lfe_peak_prob=[0.3] * 24,
        outage_windows=[19, 20],  # Block 7-9 PM
    )
    
    print("\n=== MILP Test Result ===")
    print(f"Pipeline: {result.get('pipeline')}")
    print(f"Total Cost: Rs. {result.get('total_cost')}")
    print(f"Baseline Cost: Rs. {result.get('baseline_cost')}")
    print(f"Savings: Rs. {result.get('savings_rs')} ({result.get('savings_pct')}%)")
    print(f"Solve Time: {result.get('solve_time_ms')} ms")
    print("\nSchedule:")
    for s in result.get('schedule', []):
        print(f"  {s['appliance']:15} @ {s['time_label']} - Rs.{s['cost_rs']} ({s['slot_color']})")
    
    return result


if __name__ == '__main__':
    test_solver()
