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
    user_price = params.initial_price
    
    # FIX: Ensure base demand is always high enough to generate sales, 
    # even if you type a massive initial price in the UI.
    working_base_demand = max(params.base_demand, int(user_price * params.sensitivity) + 80)
    
    # 1. Extend to 30 Days
    for day in range(1, 31): 
        
        # 2. The Weekend Surge (Every 7th day, demand spikes)
        is_weekend = (day % 7 == 6) or (day % 7 == 0)
        daily_base_demand = int(random.gauss(working_base_demand + (100 if is_weekend else 0), 20))
        
        # 3. Dynamic Pricing Engine
        # If we drop below 30% inventory, raise prices by 20% to slow down sales
        if current_inventory > 0 and current_inventory < (params.total_inventory * 0.3):
            user_price = params.initial_price * 1.2 
        else:
            user_price = params.initial_price
        
        # 4. AI Competitor Bots
        if random.random() < 0.30:
            aggressive_price = user_price * 0.75 # 25% Flash Sale
        else:
            aggressive_price = user_price * 0.90 # Standard 10% undercutting
            
        premium_price = max(params.initial_price * 1.2, params.cost_price + 50) 
        
        # 5. Demand Calculation
        raw_quantity = daily_base_demand - (params.sensitivity * user_price)
        daily_sales = max(0, int(raw_quantity)) 
        
        # If competitor runs a flash sale, you lose 50% of your daily customers
        if aggressive_price < (user_price * 0.80):
            daily_sales = int(daily_sales * 0.50)
            
        if daily_sales > current_inventory:
            daily_sales = current_inventory
            
        # 6. Financials
        daily_profit = (user_price - params.cost_price) * daily_sales if current_inventory > 0 else 0
        current_inventory -= daily_sales
        if current_inventory < 0: 
            current_inventory = 0
        
        history.append({
            "day": day,
            "revenue": daily_profit, 
            "stock_level": current_inventory,
            "competitor_price": aggressive_price,
            "premium_price": premium_price
        })

    return {"history": history}