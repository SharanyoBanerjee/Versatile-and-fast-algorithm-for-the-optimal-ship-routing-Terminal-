# Ocean Route Optimizer

A JavaScript-based optimization engine for finding efficient and safe ship routes across the Indian Ocean.

The project models the ocean as a geographic weighted graph and uses pathfinding algorithms such as **Dijkstra's Algorithm** and **A*** to calculate routes between ports. The architecture is designed to evolve from basic geographic shortest-path routing into a **dynamic, multi-objective ship-routing system** that can account for ship characteristics, weather, ocean currents, fuel consumption, travel time, and route safety.

> **Hackathon Problem:** Development of a versatile and fast algorithm for the optimal ship routing
> **Domain:** Transportation & Logistics
> **Region:** Indian Ocean
> **Implementation:** JavaScript / Node.js

---

## Table of Contents

* [Overview](#overview)
* [Problem Statement](#problem-statement)
* [Project Objective](#project-objective)
* [Core Idea](#core-idea)
* [How the System Works](#how-the-system-works)
* [Current Capabilities](#current-capabilities)
* [Architecture](#architecture)
* [Algorithms](#algorithms)
* [Geographic Model](#geographic-model)
* [Port Model](#port-model)
* [Optimization Model](#optimization-model)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Running the Project](#running-the-project)
* [Running Tests](#running-tests)
* [Example Workflow](#example-workflow)
* [Development Roadmap](#development-roadmap)
* [Technical Decisions](#technical-decisions)
* [Performance Strategy](#performance-strategy)
* [Future Improvements](#future-improvements)
* [Limitations](#limitations)
* [Hackathon Relevance](#hackathon-relevance)
* [Technology Stack](#technology-stack)
* [Author](#author)

---

# Overview

Ocean Route Optimizer is a routing and optimization system designed for maritime transportation.

Traditional shortest-path algorithms can find the geographically shortest route, but real-world ship routing is considerably more complicated.

A ship may need to consider:

* Distance
* Travel time
* Fuel consumption
* Wind
* Waves
* Ocean currents
* Ship speed
* Ship-specific operating limits
* Weather safety
* Navigation constraints
* Changing environmental conditions

Therefore, the long-term goal of this project is not simply:

> "Find the shortest path."

Instead, the system aims to answer:

> **"Given a ship, its destination, and changing ocean conditions, what is the most efficient and safe route?"**

---

# Problem Statement

Maritime transportation consumes significant amounts of fuel, making route optimization an important problem for reducing operational costs and environmental impact.

The optimal route for a vessel is not necessarily the geographically shortest route.

For example:

```text
                    BAD WEATHER
                 ~~~~~~~~~~~~~~~~~
                ~~~~~~~~~~~~~~~~~~~
START  ────────────────X───────────────  DESTINATION
       \                               /
        \                             /
         \___________________________/
              SAFER ROUTE
```

A direct route may be shorter but expose the vessel to severe weather.

A slightly longer route may:

* consume less fuel,
* reduce travel time under favorable currents,
* avoid dangerous waves,
* improve vessel safety,
* or provide better overall efficiency.

The system therefore needs to support **weighted and dynamic path optimization** rather than simple geometric shortest paths.

---

# Project Objective

The project aims to build a versatile routing engine capable of:

1. Representing the Indian Ocean as a geographic graph.
2. Identifying navigable ocean regions.
3. Connecting real-world ports to the routing graph.
4. Finding efficient routes using graph-search algorithms.
5. Supporting different ship characteristics.
6. Incorporating environmental conditions.
7. Optimizing multiple objectives.
8. Recalculating routes when conditions change.
9. Maintaining reasonable computation time for large geographic grids.

---

# Core Idea

The ocean is represented as a **weighted geographic graph**.

```text
              Ocean Grid

       ●────●────●────●
       │ ╲  │  ╱ │  ╱
       ●────●────●────●
       │ ╱  │ ╲  │ ╱
       ●────●────●────●
       │    │    │
       ●────●────●────●
```

Each point represents a geographic location.

Each connection represents a possible movement between two locations.

The weight of an edge represents the cost of travelling between those locations.

Initially:

```text
Edge Cost = Geographic Distance
```

Later:

```text
Edge Cost =
    Travel Time
    + Fuel Consumption
    + Weather Risk
    + Wave Risk
    + Current Effects
    + Other Constraints
```

This allows the same routing algorithm to work with increasingly sophisticated maritime models.

---

# How the System Works

The overall pipeline is:

```text
                    USER INPUT
                        │
                        ▼
                 ┌─────────────┐
                 │    Ports    │
                 └──────┬──────┘
                        │
                        ▼
               Geographic Coordinates
                        │
                        ▼
                 ┌─────────────┐
                 │  Land Mask  │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ Ocean Grid  │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │    Graph    │
                 └──────┬──────┘
                        │
                        ▼
              Nearest Navigable Nodes
                        │
                        ▼
                 ┌─────────────┐
                 │     A*      │
                 └──────┬──────┘
                        │
                        ▼
                   ROUTE PATH
```

Future environmental information will enter the system before route calculation:

```text
                 Weather Data
                      │
             ┌────────┼────────┐
             ▼        ▼        ▼
           Wind     Waves   Currents
             │        │        │
             └────────┼────────┘
                      ▼
                 Edge Costs
                      │
                      ▼
                  Ship Model
                      │
                      ▼
                     A*
                      │
                      ▼
                Optimal Route
```

---

# Current Capabilities

The current implementation contains the core routing foundation.

### Implemented

* Node.js project setup
* JavaScript ES Modules
* Geographic coordinate model
* Haversine distance calculation
* Graph representation
* Weighted graph edges
* Priority Queue
* Dijkstra's Algorithm
* A* Search
* Configurable geographic grid
* Navigability filtering
* Real land/ocean GeoJSON support
* Point-in-polygon land detection
* Real-world port dataset
* Port searching
* Port lookup
* Nearest navigable grid-node lookup
* Automated Node.js tests

### Currently being developed

* Robust integration between ports and geographic grids
* Ship characteristics
* Weather modelling
* Ocean-current modelling
* Multi-objective route costs
* Dynamic routing

---

# Architecture

The system is divided into independent layers.

```text
┌───────────────────────────────────────┐
│                CLI                    │
├───────────────────────────────────────┤
│             Port Layer                │
├───────────────────────────────────────┤
│          Geographic Layer             │
├───────────────────────────────────────┤
│            Graph Layer                │
├───────────────────────────────────────┤
│          Routing Algorithms           │
├───────────────────────────────────────┤
│       Optimization / Cost Model       │
├───────────────────────────────────────┤
│      Weather / Ocean Environment      │
└───────────────────────────────────────┘
```

Each layer has a separate responsibility.

This separation makes it possible to improve the geographic model without rewriting A*, or change the cost function without rewriting the graph structure.

---

# Algorithms

## Dijkstra's Algorithm

Dijkstra's algorithm is implemented as a **baseline routing algorithm**.

It solves the shortest-path problem for graphs with non-negative edge weights.

The algorithm maintains:

```text
dist[node]
```

which represents the currently known cheapest cost to reach a node.

For every edge:

```text
u → v
```

the algorithm performs relaxation:

```text
newDistance = distance[u] + weight(u, v)
```

If:

```text
newDistance < distance[v]
```

then the path is updated.

### Complexity

Using a binary heap priority queue:

```text
O((V + E) log V)
```

where:

* `V` = number of vertices
* `E` = number of edges

Dijkstra is retained because it provides a useful correctness and performance baseline for evaluating A*.

---

# A* Search

A* is the primary routing algorithm.

It improves upon Dijkstra by using a heuristic to estimate the remaining cost to the destination.

The evaluation function is:

```text
f(n) = g(n) + h(n)
```

where:

* `g(n)` = cost from the start to node `n`
* `h(n)` = estimated cost from `n` to the destination
* `f(n)` = estimated total cost

For the geographic routing system, the heuristic is based on **Haversine distance**.

```text
Current Node
      │
      ├── g(n) → Cost already travelled
      │
      └── h(n) → Estimated geographic distance
                    to destination
```

This allows A* to prioritize nodes that are more promising toward the destination.

### Why A*?

Dijkstra explores outward without knowing which direction leads toward the destination.

A* adds geographic knowledge through its heuristic.

Therefore:

```text
Dijkstra
START
  ↓
explores broadly
  ↓
DESTINATION
```

while:

```text
A*
START
  ↓
uses h(n)
  ↓
prioritizes promising directions
  ↓
DESTINATION
```

For large geographic grids, this can significantly reduce unnecessary exploration.

---

# Geographic Model

## Coordinates

Every geographic location is represented using:

```text
Latitude
Longitude
```

For example:

```text
latitude: 18.94
longitude: 72.84
```

---

## Haversine Distance

Because Earth is approximately spherical, ordinary Euclidean distance is not appropriate for large geographic distances.

The system uses the Haversine formula.

```text
a = sin²(Δφ / 2)
    + cos(φ₁) × cos(φ₂) × sin²(Δλ / 2)

c = 2 × atan2(√a, √(1-a))

d = R × c
```

where:

```text
R = Earth's radius ≈ 6371 km
```

This gives the great-circle distance between two geographic coordinates.

---

# Ocean Grid

The routing environment is represented as a configurable geographic grid.

Example:

```text
●───●───●───●
│ ╲ │ ╱ │ ╲ │
●───●───●───●
│ ╱ │ ╲ │ ╱ │
●───●───●───●
```

Each grid node contains:

* Unique ID
* Latitude
* Longitude
* Navigability state

Example:

```text
N10_15
```

represents a grid location.

The grid supports configurable:

```text
minLat
maxLat
minLon
maxLon
step
navigability
```

This makes it possible to increase or decrease geographic resolution.

---

# Land Mask

Real-world geographic data is required to prevent routes from passing through land.

The system uses GeoJSON land polygons.

```text
        LAND
     █████████
     █████████
~~~~~~~~~~~~~~~~~~~~
~~~~~~ OCEAN ~~~~~~~
~~~~~~~~~~~~~~~~~~~~
```

A point-in-polygon algorithm determines whether a coordinate lies inside a land polygon.

The routing grid then treats:

```text
Land → non-navigable
Ocean → navigable
```

The land mask is intentionally separated from the routing algorithm.

Therefore the routing engine does not need to know where India, Africa, Sri Lanka, or any other geographic region is located.

---

# Port Model

Ports are stored separately from the routing graph.

Example:

```json
{
    "id": "INMUM",
    "name": "Mumbai Port",
    "country": "India",
    "latitude": 18.94,
    "longitude": 72.84
}
```

The port system supports:

* Port lookup by ID
* Port lookup by name
* Port search
* Finding the nearest port to coordinates
* Mapping ports to navigable grid nodes

---

## Port-to-Grid Mapping

A real port coordinate will usually not lie exactly on a grid point.

For example:

```text
Port
18.94° N
72.84° E
```

may have nearby grid points:

```text
19° N, 73° E
19° N, 72° E
18° N, 73° E
18° N, 72° E
```

The system finds the nearest **navigable** grid node.

```text
                Grid
        ●───────●───────●
        │       │       │
        │   PORT│       │
        │     ↘ │       │
        ●───────●───────●
                ↑
        nearest navigable node
```

This allows real-world ports to interact with an abstract geographic routing graph.

---

# Optimization Model

The initial routing problem is:

```text
Minimize geographic distance
```

The long-term optimization objective is multi-dimensional.

A generalized cost function is:

```text
C(P) =
    wt × T(P)
  + wf × F(P)
  + ws × S(P)
  + wr × R(P)
```

where:

* `T(P)` = travel time
* `F(P)` = fuel consumption
* `S(P)` = safety cost
* `R(P)` = environmental/weather risk
* `wt, wf, ws, wr` = configurable weights

The components should be normalized before combining them.

This allows different optimization strategies.

---

# Optimization Modes

The planned system will support modes such as:

### Fastest

Prioritize:

```text
Travel Time
```

### Fuel Efficient

Prioritize:

```text
Fuel Consumption
```

### Safest

Prioritize:

```text
Weather / Wave / Safety
```

### Balanced

Balance:

```text
Time
Fuel
Safety
Weather
```

The same underlying routing engine can therefore support different operational objectives.

---

# Dynamic Routing

Ocean conditions change over time.

Therefore, the final routing model should not treat edge costs as permanently fixed.

Instead:

```text
Cost(edge, time)
```

can depend on the estimated time at which the ship reaches that edge.

Conceptually:

```text
START
  │
  ▼
Edge 1
  │
  │ t = 2h
  ▼
Edge 2
  │
  │ t = 5h
  ▼
Edge 3
```

Weather at `t = 5h` may differ from weather at `t = 0`.

This leads to a **time-dependent routing problem**.

The long-term algorithm will therefore evolve toward:

```text
Time-Dependent A*
```

combined with route replanning.

---

# Project Structure

```text
ocean-route-optimizer/
│
├── data/
│   ├── ne_110m_land.geojson
│   └── ports.json
│
├── src/
│   │
│   ├── geography/
│   │   ├── coordinates.js
│   │   ├── distance.js
│   │   ├── grid.js
│   │   ├── landMask.js
│   │   └── buildGraph.js
│   │
│   ├── ports/
│   │   └── portManager.js
│   │
│   └── routing/
│       ├── graph.js
│       ├── priorityQueue.js
│       ├── dijkstra.js
│       └── astar.js
│
├── tests/
│   ├── astar.test.js
│   ├── cost.test.js
│   ├── dijsktra.test.js
│   ├── distance.test.js
│   ├── graph.test.js
│   ├── grid.test.js
│   ├── landMask.test.js
│   └── portManager.test.js
│
├── package.json
└── README.md
```

> The exact test filenames may evolve during development.

---

# Installation

## Requirements

* Node.js 22+
* npm

Verify Node.js:

```bash
node --version
```

Verify npm:

```bash
npm --version
```

---

## Clone the Repository

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd ocean-route-optimizer
```

Install dependencies:

```bash
npm install
```

---

# Running the Project

Start the application using:

```bash
npm start
```

The CLI provides the entry point for interacting with the routing engine.

The planned interface will allow users to select:

```text
1. Calculate Route
2. View Ports
3. View Ships
4. Exit
```

The route calculation workflow will eventually become:

```text
Select Source Port
        ↓
Select Destination Port
        ↓
Select Ship
        ↓
Select Optimization Mode
        ↓
Load Environmental Conditions
        ↓
Calculate Route
        ↓
Display Route Statistics
```

---

# Running Tests

The project uses Node.js's built-in test runner.

Run:

```bash
npm test
```

The test suite validates individual components independently.

Examples include:

```text
Distance calculations
Graph storage
Grid generation
Grid neighbors
Land detection
Port lookup
Port searching
Nearest port
A* routing
Cost calculations
```

Testing individual components allows algorithmic changes to be validated without relying entirely on end-to-end tests.

---

# Example Workflow

A simplified future route calculation might look like:

```text
Source:
Mumbai Port

Destination:
Port of Singapore

Ship:
Container Ship

Optimization:
Fuel Efficient
```

The system then performs:

```text
Mumbai
  ↓
18.94, 72.84
  ↓
Nearest navigable grid node
  ↓
Ocean graph
  ↓
Environmental conditions
  ↓
Ship-specific edge costs
  ↓
A*
  ↓
Route
  ↓
Singapore
```

The final output can include:

```text
Route Distance
Estimated Travel Time
Estimated Fuel Consumption
Safety Score
Major Waypoints
Optimization Mode
```

---

# Development Roadmap

The project is being developed incrementally.

## Phase 1 — Project Foundation

* Node.js
* ES Modules
* CLI
* Project structure

**Status: Complete**

---

## Phase 2 — Ocean as a Graph

* Graph nodes
* Graph edges
* Weighted connections

**Status: Complete**

---

## Phase 3 — Geographic Distance

* Latitude/longitude model
* Haversine distance

**Status: Complete**

---

## Phase 4 — Dijkstra Baseline

* Priority queue
* Dijkstra implementation
* Path reconstruction

**Status: Implemented**

---

## Phase 5 — A* Routing

* A* search
* Geographic heuristic
* Path reconstruction

**Status: Implemented**

---

## Phase 6 — Configurable Ocean Grid

* Latitude/longitude grid
* Configurable resolution
* Eight-direction movement
* Navigability support

**Status: Implemented**

---

## Phase 7 — Real Geographic Data

* GeoJSON land data
* Land mask
* Point-in-polygon detection

**Status: Implemented**

---

## Phase 8 — Real Ports

* Port dataset
* Port lookup
* Port search
* Nearest navigable node

**Status: In Progress**

---

## Phase 9 — Ship Model

Planned:

* Ship type
* Cruising speed
* Fuel consumption
* Maximum operating conditions
* Ship-specific constraints

**Status: Planned**

---

## Phase 10 — Weather Model

Planned:

* Wind
* Waves
* Weather severity
* Environmental conditions

**Status: Planned**

---

## Phase 11 — Ship + Weather Interaction

The system will estimate how environmental conditions affect different ships.

For example:

```text
Wind
  +
Wave Height
  +
Current
  +
Ship Characteristics
        ↓
Effective Speed
        ↓
Travel Time
```

**Status: Planned**

---

## Phase 12 — Optimization Cost Function

Introduce configurable costs for:

```text
Time
Fuel
Safety
Weather
```

**Status: Planned**

---

## Phase 13 — Multiple Optimization Modes

Support:

```text
Fastest
Safest
Fuel Efficient
Balanced
```

**Status: Planned**

---

## Phase 14 — Time-Dependent A*

Weather and ocean conditions will vary with time.

The routing engine will therefore evaluate:

```text
Cost(edge, time)
```

rather than using a permanently fixed edge cost.

**Status: Planned**

---

## Phase 15 — Route Replanning

When conditions change significantly:

```text
Current Route
      ↓
Updated Weather
      ↓
Recalculate
      ↓
New Optimal Route
```

**Status: Planned**

---

## Phase 16 — Performance Optimization

Potential optimizations include:

* Spatial indexing
* Efficient nearest-node lookup
* Faster land-mask queries
* Reduced graph construction time
* Priority queue improvements
* Grid resolution management
* Caching
* Search-space reduction

**Status: Planned**

---

## Phase 17 — Production CLI

Improve the command-line interface with:

* Better route visualization
* Route statistics
* Ship selection
* Optimization selection
* Weather summaries
* Error handling
* Configuration options

**Status: Planned**

---

## Phase 18 — Hackathon Demonstration

Final demonstration workflow:

```text
Mumbai
   ↓
Container Ship
   ↓
Weather Conditions
   ↓
Optimization Objective
   ↓
Dynamic A*
   ↓
Optimal Indian Ocean Route
   ↓
Distance / Time / Fuel / Safety
```

**Status: Planned**

---

# Technical Decisions

## Why JavaScript?

The original problem statement recommends Python, but this implementation intentionally uses JavaScript and Node.js.

Reasons include:

* Strong familiarity with JavaScript
* Easy CLI development
* Large ecosystem
* Shared language between frontend and backend
* Easy future web-interface integration
* Suitable asynchronous programming model
* Straightforward JSON/GeoJSON processing

The algorithmic implementation itself does not depend on Python-specific features.

---

# Why Not Use an A* Library?

The routing algorithm is one of the core contributions of the project.

Therefore, A* and Dijkstra are implemented directly instead of relying on a pathfinding package.

This provides:

* Full control over the routing algorithm
* Better understanding of the implementation
* Easier customization
* Easier integration with dynamic edge costs
* Better ability to explain the algorithm during technical evaluation

Libraries are used where they provide infrastructure rather than replacing the core optimization logic.

---

# Why Dijkstra and A* Both Exist

Dijkstra is not redundant.

It serves as a baseline.

We can compare:

```text
Dijkstra
    vs
A*
```

in terms of:

* Route correctness
* Nodes explored
* Execution time
* Scalability

This gives the project an experimental and performance-oriented component.

---

# Why Haversine Distance?

Latitude and longitude are spherical geographic coordinates.

For short distances, simple approximations may work, but for routes spanning thousands of kilometres across the Indian Ocean, spherical distance is more appropriate.

Haversine distance therefore provides:

* Geographic correctness
* A useful edge cost
* An admissible-style lower-bound heuristic for geographic A* when used consistently with the cost model

As the cost function becomes more complex, the heuristic will need to remain compatible with the optimized objective.

---

# Why a Grid?

A grid provides a controllable representation of the ocean.

Advantages:

* Simple graph construction
* Predictable neighbor relationships
* Adjustable resolution
* Easy integration with raster-like environmental data
* Suitable for A* search
* Easy visualization

Later, the grid can be replaced or supplemented by more sophisticated geographic representations if necessary.

---

# Performance Strategy

The system is designed to progressively increase complexity.

Initially:

```text
Small Grid
+
Simple Distance Cost
+
A*
```

Then:

```text
Larger Grid
+
Real Geography
+
Ship Model
+
Weather
+
Dynamic Costs
```

Performance optimization will be introduced only after correctness has been established.

Potential bottlenecks include:

### Land Mask

Checking every polygon for every grid node can become expensive.

Potential solution:

```text
Spatial Index
      ↓
Only inspect nearby polygons
```

### Nearest Node

Current approach:

```text
Check every grid node
```

Future approach:

```text
Spatial lookup
      ↓
Nearby candidate nodes
```

### Routing

Future optimization can reduce the search space using:

* Better heuristics
* Caching
* Hierarchical grids
* Search pruning
* Adaptive resolution

---

# Future Improvements

The long-term system can be expanded with:

## Environmental Data

* Real-time weather
* Wind fields
* Wave forecasts
* Ocean currents
* Sea-state information

## Ship Physics

* Hull characteristics
* Engine performance
* Fuel curves
* Wind resistance
* Wave resistance
* Current-assisted velocity

## Advanced Optimization

* Multi-objective optimization
* Pareto-optimal routes
* Constraint-based routing
* Time-dependent routing
* Dynamic replanning

## Geographic Improvements

* Higher-resolution coastlines
* Bathymetry
* Restricted waters
* Shipping lanes
* Ports and terminals
* Maritime boundaries

## User Interface

The current system is CLI-first so the optimization engine remains independent from presentation.

A future interface could provide:

```text
Interactive Map
      +
Route Visualization
      +
Weather Overlay
      +
Ship Configuration
      +
Optimization Controls
```

---

# Limitations

The current implementation is an evolving research/prototype system.

At the current stage:

* The weather model is not yet integrated.
* Fuel consumption is not yet physically modelled.
* Ocean currents are not yet integrated.
* Wave dynamics are not yet integrated.
* Ship-specific physics are not yet implemented.
* Current geographic resolution is intentionally limited.
* Port coordinates are a demonstration dataset.
* The current route cost primarily represents geographic distance.
* Real-time route replanning is not yet implemented.

These limitations are intentional because the project is being developed incrementally from a verified routing foundation.

---

# Hackathon Relevance

The project directly addresses the central requirement of developing a **versatile and fast algorithm for optimal ship routing**.

The architecture is specifically designed around the problem's major requirements:

| Requirement         | Approach                                 |
| ------------------- | ---------------------------------------- |
| Geographic routing  | Lat/Lon ocean grid                       |
| Land avoidance      | GeoJSON land mask                        |
| Multiple ship types | Ship model                               |
| Weather influence   | Environmental cost model                 |
| Fuel optimization   | Fuel-based edge cost                     |
| Safety              | Risk constraints/cost                    |
| Travel time         | Time-dependent cost                      |
| Changing weather    | Dynamic route replanning                 |
| Fast routing        | A*                                       |
| Extensibility       | Modular architecture                     |
| Indian Ocean focus  | Indian Ocean geographic bounds and ports |

The key architectural principle is:

> **Separate the environment model from the routing algorithm.**

This means the routing engine can evolve without rewriting the geographic, weather, or ship systems.

---

# Technology Stack

### Core

* JavaScript
* Node.js
* ES Modules

### Algorithms

* Dijkstra's Algorithm
* A* Search
* Haversine Distance
* Point-in-Polygon
* Priority Queue

### Data

* JSON
* GeoJSON

### Testing

* Node.js Built-in Test Runner

### Planned

* Weather/Ocean datasets
* Ship performance models
* Spatial indexing
* Interactive visualization

---

# Getting Started

The recommended development sequence is:

```text
1. Install Node.js
        ↓
2. Install dependencies
        ↓
3. Add geographic data
        ↓
4. Run tests
        ↓
5. Run CLI
        ↓
6. Select ports
        ↓
7. Calculate route
```

Always verify the test suite before adding a new routing feature:

```bash
npm test
```

The routing engine should remain independently testable as new environmental and optimization layers are introduced.

---

# Design Philosophy

The project follows three principles:

### 1. Correctness First

Build and verify the basic routing engine before introducing complex environmental models.

### 2. Modularity

Geography, ports, ships, weather, costs, and routing algorithms remain separate components.

### 3. Extensibility

The initial distance-based routing model is deliberately simple so it can evolve into a dynamic multi-objective optimization engine.

---

# Final System Vision

The final system is intended to evolve into:

```text
                    ┌─────────────────┐
                    │    Ship Input   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Source / Goal   │
                    │      Ports       │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
   Wind Data             Wave Data           Current Data
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Environment +   │
                    │  Ship Model     │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Dynamic Edge    │
                    │     Costs       │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Time-Dependent  │
                    │       A*        │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Optimal Route   │
                    └────────┬────────┘
                             ▼
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
          Distance          Fuel             Safety
             │               │                │
             └───────────────┼────────────────┘
                             ▼
                    Route Recommendation
```

The ultimate goal is to transform a basic geographic shortest-path problem into a **dynamic, ship-aware, weather-aware, multi-objective maritime route optimization system for the Indian Ocean**.

---

# Author

**Sharanyo Banerjee**

B.Tech Computer Science & Engineering
AI & ML Specialization

---

## Project Status

**Active Development**

The routing foundation is implemented and the system is progressively being extended toward dynamic maritime optimization.
