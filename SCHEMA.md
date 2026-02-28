Table 1: users (For Authentication & Saving Profiles)

id (UUID, Primary Key) - Auto-generated unique ID.

email (String) - User's email address.

created_at (Timestamp) - Account creation date.



Table 2: simulations (The Core Engine Data)

id (UUID, Primary Key) - Unique ID for each simulation run.

user_id (UUID, Foreign Key) - Links back to the users table.

created_at (Timestamp) - When the simulation was run.

Input Parameters:

cost_price (Float)

initial_price (Float)

total_inventory (Integer)

sensitivity (Float)

Output Metrics:

ai_total_profit (Float)

static_total_profit (Float)

competitor_total_profit (Float)

units_sold (Integer)

Time-Series Data:

daily_history (JSONB) - Stores the entire 30-day array of prices and market share in one column.
