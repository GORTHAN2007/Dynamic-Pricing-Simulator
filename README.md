# Project Title: Dynamic Pricing Simulator
One line project description: An autonomous economic simulation engine that can stress-test dynamic pricing models against AI-driven competitor agents to maximize revenue and inventory health.

## 1. Problem Statement
### Problem Title: Dynamic Pricing Simulator
Businesses lack an interactive simulation system that models pricing decisions under realistic constraints.
### Problem Description: 
In competitive e-commerce markets, pricing decisions directly impact revenue, market share, and inventory turnover. Businesses must constantly balance demand elasticity, competitor behavior, and stock availability while adjusting pricing strategies. However, most pricing decisions are made using static spreadsheets or limited historical data analysis. There is limited opportunity to simulate dynamic market environments before implementing pricing strategies in real-world systems.

### Target Users: 
* E-commerce Category Managers
* Revenue Growth and Optimization Teams
* Inventory and Supply Chain Analysts

### Existing Gaps
* Businesses lack an interactive simulation system that models pricing under realistic constraints.
* Difficulty in modeling demand curves and competitor reactions accurately.
* Inability to evaluate the long-term impact of short-term pricing "race-to-the-bottom" tactics.
* Without predictive simulation:
    Pricing strategies may reduce profit margins,
    Overstock or stockouts may occur,
    Market share may decline unexpectedly,
    Businesses react rather than strategize,
    Revenue optimization opportunities are missed,
    Lack of experimentation tools limits strategic decision-making.

## 2. Problem Understanding & Approach

### Root Cause Analysis
The primary issue is the high financial risk associated with real-world pricing experimentation. Without a predictive simulation framework, businesses react to market shifts rather than strategizing for them, leading to missed revenue optimization and unexpected stockouts.

### Solution Strategy
Our approach is to build a **Dynamic Pricing Simulator** that enables strategic experimentation in a controlled environment. We utilize a mathematical demand-elasticity engine and autonomous competitor bots to visualize the friction between pricing, market share, and stock levels over time.

## 3. Proposed Solution

### Solution Overview
Our simulator provides a high-fidelity "War Room" dashboard where users can configure product parameters and run pricing strategies across simulated time periods.

### Core Idea
To democratize advanced economic modeling by providing an interactive platform where users "play" against different market personalities to find the optimal price-to-inventory balance. The objective is to create simulation engine that enables strategic pricing experimentation in a controlled environment.

### Key Features
* **Configurable Parameters:** Users can adjust base demand, price sensitivity, and inventory constraints.
* **Intelligent Competitor Bots:** Models reactions from "Aggressive Under-cutters" to "Premium Players".
* **Dynamic Visualizations:** Animated time-series charts for scenario comparison of revenue, market share, and stock levels.

## 4. System Architecture

### High-Level Flow
**User** → **Next.js Frontend** → **FastAPI Backend** → **Simulation Engine** → **Supabase Database** → **Visual Response**

### Architecture Description
The system follows a decoupled architecture. The **Frontend** (Next.js) handles state management and real-time chart rendering via Recharts. The **Backend** (FastAPI) executes the core simulation loops, demand math, and competitor agent logic.

### Architecture Diagram:
![System Architecture](./images/architecture-diagram.png)
