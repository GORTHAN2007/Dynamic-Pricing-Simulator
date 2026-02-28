import random

def run_dynamic_pricing(days_to_run, base_price, initial_inventory):
    current_inventory = initial_inventory
    day = 1
    total_revenue = 0
    total_items_sold = 0
    
    print("--- Starting Advanced Simulation ---")
    
    while day <= days_to_run and current_inventory > 0:
        # 1. Day of the Week (Modulo logic)
        is_weekend = (day % 7 == 6) or (day % 7 == 0)
        mean_demand = 12 if is_weekend else 8
        demand = int(random.gauss(mean_demand, 3))
        
        if demand < 0:
            demand = 0
            
        # 2. Competitor Actions (Probability)
        competitor_sale_active = random.random() < 0.20
        
        # 3. Dynamic Pricing Engine
        if competitor_sale_active:
            current_price = base_price * 0.8 
            print(f"  [ALERT] Competitor sale detected on Day {day:02d}!")
        elif current_inventory < 15:
            current_price = base_price * 1.5 
        elif demand > 10:
            current_price = base_price * 1.2 
        else:
            current_price = base_price 
            
        # 4. Process Sales
        items_sold = demand
        if items_sold > current_inventory:
            items_sold = current_inventory
            
        daily_revenue = items_sold * current_price
        total_revenue += daily_revenue
        total_items_sold += items_sold
        current_inventory -= items_sold
        
        print(f"Day {day:02d} | Demand: {demand:02d} | Price: ${current_price:5.2f} | Sold: {items_sold:02d} | Stock: {current_inventory:02d}")
        
        day += 1
        
    # --- Performance Summary ---
    print("\n--- Simulation Summary ---")
    if total_items_sold > 0:
        # Calculate the actual average price people paid
        average_price = total_revenue / total_items_sold
        
        # Calculate what would have happened if we never changed the price
        static_revenue = total_items_sold * base_price
        difference = total_revenue - static_revenue
        
        print(f"Total Items Sold: {total_items_sold}")
        print(f"Average Price per Unit: ${average_price:.2f}")
        print(f"Static Strategy Revenue: ${static_revenue:.2f}")
        print(f"Dynamic Strategy Revenue: ${total_revenue:.2f}")
        
        if difference > 0:
            print(f"Result: Dynamic pricing OUTPERFORMED static by ${difference:.2f}!")
        elif difference < 0:
            print(f"Result: Dynamic pricing UNDERPERFORMED static by ${abs(difference):.2f}.")
        else:
            print("Result: Dynamic pricing tied with the static strategy.")
    else:
        print("No items were sold during the simulation.")

# Run a 14-day test
run_dynamic_pricing(14, 50, 100)