# ⚙️ API Structure & Documentation

Our backend follows a RESTful architecture, built entirely in Python using **FastAPI**. It is designed as a stateless, high-speed calculation engine to run complex market simulations.

### **Base URL**
* **Local Development:** `http://127.0.0.1:8000`
* **Interactive API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`

---

## **Endpoint: Run Pricing Simulation**

* **Path:** `/api/simulate`
* **Method:** `POST`
* **Description:** Accepts market parameters, runs a 30-day algorithmic pricing simulation using a Greedy Profit Optimization algorithm against an AI competitor.

### **Request Body**
The payload is strictly validated via **Pydantic** models.

\`\`\`json
{
  "initial_price": 45.0,
  "cost_price": 30.0,
  "total_inventory": 3000,
  "base_demand": 200,
  "sensitivity": 2.5
}
\`\`\`

### **Response Body**
Returns a structured JSON object containing a \`history\` array and a \`summary\` object.

**Status: 200 OK**
\`\`\`json
{
  "history": [
    {
      "day": 1,
      "user_price": 42.50,
      "competitor_price": 40.00,
      "market_share": 65.5,
      "dynamic_cumulative_profit": 1500.00,
      "static_cumulative_profit": 800.00
    }
  ],
  "summary": {
    "total_profit": 45000.50,
    "total_units_sold": 2950,
    "competitor_total_profit": 12000.00
  }
}
\`\`\`

---

### **Error Handling**
**Status: 422 Unprocessable Entity**
Returned if the request body contains invalid data types, handled natively by FastAPI.
