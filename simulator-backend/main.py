from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

class SimulationParams(BaseModel):
    initial_price: float
    cost_price: float
    total_inventory: int
    base_demand: int      
    sensitivity: float    

@app.post("/api/simulate")
def run_simulation(params: SimulationParams):
    history = []
    
    # Track A: Dynamic Variables
    dynamic_inventory = params.total_inventory
    dynamic_cumulative_profit = 0
    total_units_sold = 0
    prev_dynamic_price = params.initial_price
    
    # Track B: Static Variables
    static_inventory = params.total_inventory
    static_cumulative_profit = 0
    
    # --- NEW: Track Competitor Profit ---
    competitor_cumulative_profit = 0
    
    fair_market_price = params.cost_price * 1.5
    working_base_demand = max(params.base_demand, int(fair_market_price * params.sensitivity) + 50)
    
    for day in range(1, 31): 
        is_weekend = (day % 7 == 6) or (day % 7 == 0)
        daily_base_demand = int(random.gauss(working_base_demand + (100 if is_weekend else 0), 20))
        
        competitor_fair_price = params.cost_price * random.uniform(1.3, 1.6)
        undercut_price = prev_dynamic_price * random.uniform(0.85, 0.98)
        aggressive_price = min(competitor_fair_price, undercut_price)
        
        if random.random() < 0.15: 
            aggressive_price = params.cost_price * random.uniform(1.05, 1.15)
        aggressive_price = max(aggressive_price, params.cost_price + 1)
            
        # DYNAMIC OPTIMIZER
        if dynamic_inventory <= 0:
            final_daily_price = 0
            final_daily_sales = 0
            best_daily_profit = 0
        else:
            best_daily_profit = -1
            final_daily_price = params.cost_price + 5
            final_daily_sales = 0

            strategies = [
                aggressive_price * 0.95,  
                aggressive_price,         
                aggressive_price * 1.05,  
                params.cost_price * 1.4,  
                params.initial_price      
            ]
            
            for test_price in strategies:
                actual_test_price = max(test_price, params.cost_price + 2) 
                q = daily_base_demand - (params.sensitivity * actual_test_price)
                
                if actual_test_price > aggressive_price:
                    price_ratio = aggressive_price / actual_test_price
                    q *= (price_ratio ** 5)
                
                est_sales = min(max(0, int(q)), dynamic_inventory)
                est_profit = (actual_test_price - params.cost_price) * est_sales
                
                if est_profit > best_daily_profit:
                    best_daily_profit = est_profit
                    final_daily_price = actual_test_price
                    final_daily_sales = est_sales

        dynamic_inventory -= final_daily_sales
        dynamic_cumulative_profit += best_daily_profit
        total_units_sold += final_daily_sales
        prev_dynamic_price = final_daily_price if final_daily_price > 0 else params.initial_price
        
        # --- NEW: Competitor Profit Calculation ---
        # The competitor captures the remaining demand you didn't fulfill
        competitor_sales = max(0, daily_base_demand - final_daily_sales)
        competitor_daily_profit = (aggressive_price - params.cost_price) * competitor_sales
        competitor_cumulative_profit += competitor_daily_profit
        
        # STATIC STRATEGY
        if static_inventory > 0:
            q_static = daily_base_demand - (params.sensitivity * params.initial_price)
            if params.initial_price > aggressive_price:
                price_ratio_static = aggressive_price / params.initial_price
                q_static *= (price_ratio_static ** 5) 
                
            static_sales = min(max(0, int(q_static)), static_inventory)
            static_daily_profit = (params.initial_price - params.cost_price) * static_sales
            
            static_inventory -= static_sales
            static_cumulative_profit += static_daily_profit
        
        share = (final_daily_sales / daily_base_demand * 100) if daily_base_demand > 0 else 0
        
        history.append({
            "day": day,
            "user_price": round(final_daily_price, 2) if dynamic_inventory > 0 else 0,
            "competitor_price": round(aggressive_price, 2),
            "market_share": round(share, 2),
            "items_sold": final_daily_sales,
            "stock_level": dynamic_inventory,
            "dynamic_cumulative_profit": round(dynamic_cumulative_profit, 2),
            "static_cumulative_profit": round(static_cumulative_profit, 2)
        })

    # --- NEW: Calculate Average Prices (Ignoring stockout days where price is 0) ---
    active_user_prices = [h["user_price"] for h in history if h["user_price"] > 0]
    avg_user_price = sum(active_user_prices) / len(active_user_prices) if active_user_prices else 0
    
    active_comp_prices = [h["competitor_price"] for h in history if h["competitor_price"] > 0]
    avg_comp_price = sum(active_comp_prices) / len(active_comp_prices) if active_comp_prices else 0

    # Package everything into the summary dictionary
    return {
        "history": history, 
        "summary": {
            "total_profit": round(dynamic_cumulative_profit, 2),
            "total_units_sold": total_units_sold,
            "competitor_total_profit": round(competitor_cumulative_profit, 2),
            "avg_user_price": round(avg_user_price, 2),
            "avg_competitor_price": round(avg_comp_price, 2)
        }
    }