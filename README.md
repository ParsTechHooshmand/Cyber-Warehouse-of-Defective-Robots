CyberCore Defective Robots Warehouse 2125

Challenge Description:

In the year 2125, Earth is run by the robot manufacturing company CyberCore. Thousands of defective robots are kept in huge warehouses. Your task is to build a management system to determine the storage location of each robot in the warehouse in such a way that the warehouse space is used optimally.

Challenge goal:


Using JavaScript and HTML/CSS, design a visual system that places the robots as rectangles with different sizes in a two-dimensional grid, in such a way that:

. No two robots collide with each other

. The empty space between them is minimized

. The robot data is received via a JSON input


Sample input (JSON):

[

{ “id”: “robot_01”, “width”: 2, “height”: 1 },

{ “id”: “robot_02”, “width”: 2, “height”: 1 }

]

Rules and output:

. The x and y position of each robot in the grid must be displayed.

. The output must be a web page that displays the location of each robot in the grid.

. The arrangement must fit in a 10x10 space (or larger depending on the number of robots).

Input and Output Requirements

. Input: A JSON array of robot objects, each with id (string), width (integer), and height (integer). Loaded via a textarea  
  in the UI, with options for default data or random generation.

. Output: A web page showing a grid (visual cells colored for occupied/defective/collisions), a list of robots with their  positions (e.g., “robot_01: (x, y)”), and stats like total robots, placed count, efficiency percentage, and collision count. Positions are assigned during placement and displayed in the robot list and grid cells.

Our Solution:

This project implements the challenge using pure HTML, CSS, and JavaScript. The solution creates a dynamic grid, loads robot data, applies placement algorithms to position robots without overlaps (where possible), minimizes empty space via algorithm choice, and visualizes everything in a cyber-themed interface.


. HTML Structure (index.html): Defines the UI with a header, warehouse grid (div with class ‘warehouse-grid’), system status panels (total robots, placed, efficiency, collisions), grid configuration input, JSON input textarea, algorithm selector, buttons (Load Robots, Generate Random, Optimize Placement, Clear Warehouse, Export Layout), and a robot list container. The grid starts as 10x10 but can be updated.

. CSS Styling (style.css): Provides a futuristic look with neon gradients, glass effects (backdrop-filter: blur), and animations (e.g., floating grid, glowing text, pulsing defective cells). Grid cells are styled as .grid-cell (empty), .occupied (orange gradient), .defective (red pulse via @keyframes defectivePulse), .collision (flashing red). Includes responsive design for mobile, notifications with slide-in animation, and a floating AI button.

. JavaScript Logic (script.js):

. Initializes on DOM load: Creates 10x10 grid (2D array warehouseGrid and DOM divs), loads default robots, shows notification.

. Grid management: createWarehouseGrid() builds the grid DOM and array; updateGridSize() resizes (5-50 limit) and clears placements; checkGridSize() auto-expands if total robot area >80% grid area.

. Robot loading: loadRobotsFromJSON() parses JSON, validates (array of objects with id/width/height), adds placed: false, defective (30% random chance); generateRandomRobots() creates 3-10 random robots (1-4 dimensions).

. Placement: optimizePlacement() clears prior placements, selects algorithm, runs it asynchronously (setTimeout), updates display/stats/notifications.

. Display updates: updateDisplay() colors grid cells based on occupancy/defective, adds robot ID to top-left cell; displayRobotList() creates divs for each robot with ID/size/position, styled as placed/failed.

. Stats: updateSystemStats() updates DOM with totals, efficiency (utilized cells / total *100), collisions; fills progress bars.

. Collisions: detectCollisions() scans cells for multiple robot overlaps, marks .collision, counts them.

. Other: clearWarehouse() resets all; exportLayout() downloads JSON with positions/stats; showNotification() for messages; AI button triggers random tips.

The solution ensures no intentional overlaps during placement (via canPlaceRobot() check), but detects any post-placement via separate scan. Empty space is minimized by algorithm logic (e.g., sorting largest first, evaluating waste).


Algorithms Used:

Three bin-packing algorithms are implemented for placement, selected via dropdown. All use canPlaceRobot(robot, x, y) to check bounds and no overlaps in the target area, and placeRobot() to update grid array and robot coords.


. Best Fit (bestFitPlacement()): Sorts robots descending by area (width*height). For each, scans all possible (x,y) positions. If placeable, calculates wastedSpace as count of adjacent empty cells outside the robot. Chooses position with minimal waste. Places if found. Optimizes for tight packing.

. First Fit (firstFitPlacement()): No sorting. For each robot, scans from top-left (y=0,x=0) row-by-row. Places in the first position where canPlaceRobot() returns true. Simple and fast, but may leave more gaps.

. Bottom-Left (bottomLeftPlacement()): Sorts descending by area. For each, scans all positions. Tracks the one with maximum y (bottom-most), then minimum x (left-most) among ties. Places there. Aims for stable, bottom-heavy packing.

After any algorithm, unplaced robots are marked failed. Algorithms run on copies or directly on robots array.

Ideas and Creativity:

The core idea extends the challenge by adding a cyberpunk theme (neon/glass visuals, animations) to make it engaging, like a sci-fi game. Creativity includes: defective robots (random, visual pulse) for realism; auto-grid expansion; multiple algorithms for comparison; collision detection beyond no-overlap rule; export/random generation for usability; AI button and notifications for interactive feedback. This turns a basic packing problem into an immersive warehouse simulator, while staying true to the JSON input and grid output requirements.
