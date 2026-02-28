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
    current_inventory = params.total_inventory
    current_user_price = params.initial_price
    
    total_profit = 0
    total_units_sold = 0
    
    working_base_demand = max(params.base_demand, int(current_user_price * params.sensitivity) + 80)
    
    for day in range(1, 31): 
        if current_inventory <= 0:
            history.append({"day": day, "user_price": 0, "competitor_price": 0, "market_share": 0, "items_sold": 0, "stock_level": 0})
            continue

        is_weekend = (day % 7 == 6) or (day % 7 == 0)
        daily_base_demand = int(random.gauss(working_base_demand + (100 if is_weekend else 0), 20))
        
        # Competitor targets your previous price
        aggressive_price = current_user_price * random.uniform(0.85, 0.95)
        if random.random() < 0.15: aggressive_price *= 0.70 
            
        # PROFIT OPTIMIZER: Testing strategies to find max profit
        best_daily_profit = -1
        final_daily_price = params.cost_price + 5
        final_daily_sales = 0

        strategies = [aggressive_price * 0.95, aggressive_price, aggressive_price * 1.05, params.initial_price]
        
        for test_price in strategies:
            actual_test_price = max(test_price, params.cost_price + 2)
            q = daily_base_demand - (params.sensitivity * actual_test_price)
            
            if actual_test_price > aggressive_price:
                q *= 0.5 
            
            est_sales = min(max(0, int(q)), current_inventory)
            est_profit = (actual_test_price - params.cost_price) * est_sales
            
            if est_profit > best_daily_profit:
                best_daily_profit = est_profit
                final_daily_price = actual_test_price
                final_daily_sales = est_sales

        current_user_price = final_daily_price
        current_inventory -= final_daily_sales
        
        total_profit += best_daily_profit
        total_units_sold += final_daily_sales
        
        share = (final_daily_sales / daily_base_demand * 100) if daily_base_demand > 0 else 0
        
        history.append({
            "day": day,
            "user_price": round(current_user_price, 2),
            "competitor_price": round(aggressive_price, 2),
            "market_share": round(share, 2),
            "items_sold": final_daily_sales,
            "stock_level": current_inventory
        })

    # Return the history PLUS the summary metrics
    return {
        "history": history, 
        "summary": {
            "total_profit": round(total_profit, 2),
            "total_units_sold": total_units_sold
        }
    }