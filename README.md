# Ship Routing Terminal

A fast, explainable, and modular JavaScript/Node.js terminal application for optimal maritime ship routing across the Indian Ocean.

The project models the ocean as a geographic graph and uses pathfinding algorithms—**Dijkstra's Algorithm**, **A\***, and **Time-Dependent A\***—to calculate optimal routes considering vessel performance, dynamic weather conditions, travel time, fuel consumption, and route safety.

---

## Key Features

* **Core Algorithms Built Manually**: Dijkstra, A\*, Time-Dependent A\*, Priority Queue (Binary Min-Heap), and Haversine Distance.
* **Geographic Spatial Graph**: Discretizes latitude and longitude boundaries into navigable nodes with 8-directional neighbor connectivity.
* **Time-Dependent Dynamic Routing**: Route costs vary dynamically based on the vessel's arrival time at each waypoint and changing environmental conditions.
* **Multi-Objective Optimization**: Three distinct objective profiles—`FASTEST`, `BALANCED`, and `SAFEST`.
* **Interactive Terminal CLI**: Simple, guided terminal workflow to select ships, departure/destination ports, optimization objectives, and departure timestamps.

---

## System Architecture

```text
                         USER / CLI
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
            Ports           Ship         Weather
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                        Ocean Grid
                             │
                             ▼
                           Graph
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
           Dijkstra         A*      Time-Dependent A*
                                           │
                                  ┌────────┼────────┐
                                  ▼        ▼        ▼
                               Weather   Ship     Cost
                                  │        │        │
                                  └────────┼────────┘
                                           │
                                           ▼
                                      Best Route
                                           │
                                           ▼
                                       CLI Output
```

---

## Project Structure

```text
AD_Terminal/
│
├── src/
│   ├── cli/
│   │   ├── index.js          # Main CLI application entry point
│   │   ├── prompts.js        # Terminal user input & menu handlers
│   │   └── formatter.js      # Clean route result formatting
│   │
│   ├── geography/
│   │   ├── coordinates.js    # 2D geographic Coordinate model
│   │   ├── distance.js       # Haversine great-circle distance engine
│   │   ├── grid.js           # OceanGrid & GridNode generator
│   │   └── buildGraph.js     # Converts grid nodes to graph edges
│   │
│   ├── routing/
│   │   ├── graph.js          # Graph adjacency list data structure
│   │   ├── priorityQueue.js  # Binary min-heap priority queue
│   │   ├── dijkstra.js       # Baseline Dijkstra shortest-path algorithm
│   │   ├── astar.js          # Static geographic A* pathfinding
│   │   └── timeDependentAstar.js # Time-dependent dynamic A* engine
│   │
│   ├── ships/
│   │   └── ship.js           # Ship specifications and physics methods
│   │
│   ├── weather/
│   │   └── weather.js        # Synthetic weather model & environmental impact
│   │
│   └── optimization/
│       └── cost.js           # Multi-objective weighted cost functions
│
├── data/
│   └── ports.json            # Major Indian Ocean ports database
│
├── tests/
│   ├── distance.test.js      # Haversine distance unit tests
│   ├── graph.test.js         # Graph data structure tests
│   ├── dijkstra.test.js      # Dijkstra pathfinding verification
│   ├── astar.test.js         # A* pathfinding verification
│   └── timeDependentAstar.test.js # Time-dependent routing test suite
│
├── package.json
└── README.md
```

---

## Algorithm Overview

### 1. Geographic Distance (Haversine Formula)
Computes great-circle distance over Earth's sphere ($R = 6371\text{ km}$):
$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$
$$d = 2R \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

### 2. Dijkstra's Algorithm
Baseline shortest-path algorithm using the custom binary min-heap priority queue. Guarantees the geographically shortest route based purely on static edge distance.

### 3. A\* Algorithm
Uses Haversine distance from the current node to the destination as an admissible heuristic $h(n)$ to minimize search space:
$$f(n) = g(n) + h(n)$$

### 4. Time-Dependent A\*
Expands node state to `(node, arrivalTime)`:
* Evaluates dynamic weather at the vessel's arrival time for each step.
* Calculates effective speed factoring in wind and wave penalties.
* Validates vessel operating limits (e.g. maximum tolerable wave height / wind speed).
* Optimizes a multi-objective cost function:
$$\text{Cost} = w_{\text{time}} \cdot \text{Time} + w_{\text{fuel}} \cdot \text{Fuel} + w_{\text{safety}} \cdot \text{Safety}$$

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)

### Installation
```bash
git clone https://github.com/SharanyoBanerjee/Versatile-and-fast-algorithm-for-the-optimal-ship-routing-Terminal-.git
cd Versatile-and-fast-algorithm-for-the-optimal-ship-routing-Terminal-
npm install
```

### Running the Application
Launch the interactive terminal interface:
```bash
npm start
```

### Running the Test Suite
Execute the full test suite using Node.js built-in test runner:
```bash
npm test
```

---

## Optimization Modes

| Mode | Time Weight ($w_t$) | Fuel Weight ($w_f$) | Safety Weight ($w_s$) | Focus |
| :--- | :---: | :---: | :---: | :--- |
| **FASTEST** | 0.8 | 0.1 | 0.1 | Minimizes total voyage travel time |
| **BALANCED** | 0.4 | 0.3 | 0.3 | Balanced trade-off between time, fuel burn, and safety |
| **SAFEST** | 0.1 | 0.2 | 0.7 | Prioritizes avoiding adverse weather and rough sea states |

---

## Available Vessels

* **Ocean Star**: Container Ship — Cruising speed: 22 knots | Fuel: 0.5 units/km | Max wave: 4.0m | Max wind: 35 kts
* **Pacific Trader**: Bulk Carrier — Cruising speed: 16 knots | Fuel: 0.35 units/km | Max wave: 6.0m | Max wind: 45 kts
* **Indian Voyager**: General Cargo — Cruising speed: 14 knots | Fuel: 0.3 units/km | Max wave: 3.5m | Max wind: 30 kts

---

## License

ISC
