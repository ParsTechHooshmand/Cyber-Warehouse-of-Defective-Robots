let warehouseGrid = [];
let gridSize = 10;
let robots = [];
let placedRobots = [];
let systemStats = {
    totalRobots: 0,
    placedRobots: 0,
    efficiency: 0,
    collisions: 0
};

document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
});

function initializeSystem() {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        createWarehouseGrid();
        loadDefaultRobots();
        showNotification('CyberCore System Online - Warehouse Ready', 'success');
        console.log('🤖 CyberCore Warehouse Management System 2125 - Online');
    }, 2000);
}

function updateGridSize() {
    const input = document.getElementById('gridSizeInput');
    const newSize = parseInt(input.value);
    
    if (newSize < 5) {
        showNotification('Minimum grid size is 5x5', 'warning');
        input.value = 5;
        return;
    }
    
    if (newSize > 50) {
        showNotification('Maximum grid size is 50x50', 'warning');
        input.value = 50;
        return;
    }
    
    gridSize = newSize;
    clearPlacements();
    createWarehouseGrid();
    showNotification(`Grid updated to ${gridSize}x${gridSize}`, 'success');
}

function createWarehouseGrid() {
    const grid = document.getElementById('warehouseGrid');
    grid.innerHTML = '';
    grid.style.setProperty('--grid-size', gridSize);
    
    warehouseGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.title = `Position: (${x}, ${y})`;
            grid.appendChild(cell);
        }
    }
    
    updateGridInfo();
}

function updateGridInfo() {
    document.getElementById('gridSize').textContent = `${gridSize}x${gridSize}`;
    const utilizedCells = placedRobots.reduce((sum, robot) => sum + (robot.width * robot.height), 0);
    const totalCells = gridSize * gridSize;
    const efficiency = Math.round((utilizedCells / totalCells) * 100);
    document.getElementById('utilizedSpace').textContent = `${efficiency}%`;
    
    systemStats.efficiency = efficiency;
    updateSystemStats();
}

function loadDefaultRobots() {
    const defaultData = [
        { "id": "robot_01", "width": 2, "height": 1 },
        { "id": "robot_02", "width": 1, "height": 3 },
        { "id": "robot_03", "width": 3, "height": 2 },
        { "id": "robot_04", "width": 2, "height": 2 },
        { "id": "robot_05", "width": 1, "height": 1 }
    ];
    
    document.getElementById('jsonInput').value = JSON.stringify(defaultData, null, 2);
    loadRobotsFromJSON();
}

function loadRobotsFromJSON() {
    try {
        const jsonText = document.getElementById('jsonInput').value.trim();
        if (!jsonText) {
            showNotification('Please enter robot data', 'warning');
            return;
        }
        
        const robotData = JSON.parse(jsonText);
        
        if (!Array.isArray(robotData)) {
            throw new Error('Data must be an array');
        }
        
        robots = robotData.map(robot => {
            if (!robot.id || !robot.width || !robot.height) {
                throw new Error('Each robot must have id, width, and height');
            }
            return {
                id: robot.id,
                width: parseInt(robot.width),
                height: parseInt(robot.height),
                x: null,
                y: null,
                placed: false,
                defective: Math.random() < 0.3
            };
        });
        
        systemStats.totalRobots = robots.length;
        updateSystemStats();
        displayRobotList();
        showNotification(`${robots.length} robots loaded successfully`, 'success');
        
        checkGridSize();
        optimizePlacement();
        
    } catch (error) {
        showNotification(`JSON Error: ${error.message}`, 'error');
        console.error('JSON parsing error:', error);
    }
}

function checkGridSize() {
    const totalArea = robots.reduce((sum, robot) => sum + (robot.width * robot.height), 0);
    const currentArea = gridSize * gridSize;
    
    if (totalArea > currentArea * 0.8) {
        const newSize = Math.min(Math.ceil(Math.sqrt(totalArea * 1.5)), 50);
        if (newSize > gridSize) {
            gridSize = newSize;
            document.getElementById('gridSizeInput').value = gridSize;
            createWarehouseGrid();
            showNotification(`Grid auto-expanded to ${gridSize}x${gridSize} for optimal fit`, 'info');
        }
    }
}

function generateRandomRobots() {
    const count = Math.floor(Math.random() * 8) + 3;
    const randomRobots = [];
    
    for (let i = 1; i <= count; i++) {
        randomRobots.push({
            id: `robot_${i.toString().padStart(2, '0')}`,
            width: Math.floor(Math.random() * 4) + 1,
            height: Math.floor(Math.random() * 4) + 1
        });
    }
    
    document.getElementById('jsonInput').value = JSON.stringify(randomRobots, null, 2);
    loadRobotsFromJSON();
}

function optimizePlacement() {
    const algorithm = document.getElementById('algorithm').value;
    clearPlacements();
    
    showNotification(`Running ${algorithm} algorithm...`, 'info');
    
    setTimeout(() => {
        let placementFunction;
        
        switch (algorithm) {
            case 'bestFit':
                placementFunction = bestFitPlacement;
                break;
            case 'firstFit':
                placementFunction = firstFitPlacement;
                break;
            case 'bottomLeft':
                placementFunction = bottomLeftPlacement;
                break;
            default:
                placementFunction = bestFitPlacement;
        }
        
        placementFunction();
        updateDisplay();
        updateGridInfo();
        
        const successCount = robots.filter(r => r.placed).length;
        showNotification(`${successCount}/${robots.length} robots placed successfully`, 
                        successCount === robots.length ? 'success' : 'warning');
        
    }, 500);
}

function bestFitPlacement() {
    const sortedRobots = [...robots].sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    for (const robot of sortedRobots) {
        let bestPosition = null;
        let minWastedSpace = Infinity;
        
        for (let y = 0; y <= gridSize - robot.height; y++) {
            for (let x = 0; x <= gridSize - robot.width; x++) {
                if (canPlaceRobot(robot, x, y)) {
                    const wastedSpace = calculateWastedSpace(robot, x, y);
                    if (wastedSpace < minWastedSpace) {
                        minWastedSpace = wastedSpace;
                        bestPosition = { x, y };
                    }
                }
            }
        }
        
        if (bestPosition) {
            placeRobot(robot, bestPosition.x, bestPosition.y);
        }
    }
}

function firstFitPlacement() {
    for (const robot of robots) {
        let placed = false;
        
        for (let y = 0; y <= gridSize - robot.height && !placed; y++) {
            for (let x = 0; x <= gridSize - robot.width && !placed; x++) {
                if (canPlaceRobot(robot, x, y)) {
                    placeRobot(robot, x, y);
                    placed = true;
                }
            }
        }
    }
}

function bottomLeftPlacement() {
    const sortedRobots = [...robots].sort((a, b) => (b.width * b.height) - (a.width * a.height));
    
    for (const robot of sortedRobots) {
        let bestPosition = null;
        let maxY = -1;
        let minX = gridSize;
        
        for (let y = 0; y <= gridSize - robot.height; y++) {
            for (let x = 0; x <= gridSize - robot.width; x++) {
                if (canPlaceRobot(robot, x, y)) {
                    if (y > maxY || (y === maxY && x < minX)) {
                        maxY = y;
                        minX = x;
                        bestPosition = { x, y };
                    }
                }
            }
        }
        
        if (bestPosition) {
            placeRobot(robot, bestPosition.x, bestPosition.y);
        }
    }
}

function canPlaceRobot(robot, x, y) {
    if (x + robot.width > gridSize || y + robot.height > gridSize) {
        return false;
    }
    
    for (let dy = 0; dy < robot.height; dy++) {
        for (let dx = 0; dx < robot.width; dx++) {
            if (warehouseGrid[y + dy][x + dx] !== null) {
                return false;
            }
        }
    }
    
    return true;
}

function calculateWastedSpace(robot, x, y) {
    let wastedSpace = 0;
    const surroundingArea = Math.min(gridSize, Math.max(robot.width, robot.height) + 2);
    
    for (let dy = -1; dy <= robot.height; dy++) {
        for (let dx = -1; dx <= robot.width; dx++) {
            const checkX = x + dx;
            const checkY = y + dy;
            
            if (checkX >= 0 && checkX < gridSize && checkY >= 0 && checkY < gridSize) {
                if (warehouseGrid[checkY][checkX] === null && (dx < 0 || dx >= robot.width || dy < 0 || dy >= robot.height)) {
                    wastedSpace++;
                }
            }
        }
    }
    
    return wastedSpace;
}

function placeRobot(robot, x, y) {
    robot.x = x;
    robot.y = y;
    robot.placed = true;
    
    for (let dy = 0; dy < robot.height; dy++) {
        for (let dx = 0; dx < robot.width; dx++) {
            warehouseGrid[y + dy][x + dx] = robot.id;
        }
    }
    
    if (!placedRobots.includes(robot)) {
        placedRobots.push(robot);
    }
    
    systemStats.placedRobots = placedRobots.length;
    updateSystemStats();
}

function clearPlacements() {
    warehouseGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    placedRobots = [];
    
    robots.forEach(robot => {
        robot.x = null;
        robot.y = null;
        robot.placed = false;
    });
    
    systemStats.placedRobots = 0;
    systemStats.collisions = 0;
    updateSystemStats();
    updateDisplay();
}

function updateDisplay() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const robotId = warehouseGrid[y][x];
        
        cell.className = 'grid-cell';
        cell.textContent = '';
        
        if (robotId) {
            const robot = robots.find(r => r.id === robotId);
            cell.classList.add('occupied');
            
            if (robot && robot.defective) {
                cell.classList.add('defective');
            }
            
            if (robot && x === robot.x && y === robot.y) {
                cell.textContent = robot.id.replace('robot_', 'R');
                cell.style.fontSize = '0.6rem';
                cell.style.fontWeight = '800';
            }
        }
    });
    
    displayRobotList();
    detectCollisions();
}

function detectCollisions() {
    let collisionCount = 0;
    const cells = document.querySelectorAll('.grid-cell');
    
    cells.forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        let occupyingRobots = 0;
        robots.forEach(robot => {
            if (robot.placed && 
                x >= robot.x && x < robot.x + robot.width &&
                y >= robot.y && y < robot.y + robot.height) {
                occupyingRobots++;
            }
        });
        
        if (occupyingRobots > 1) {
            cell.classList.add('collision');
            collisionCount++;
        }
    });
    
    systemStats.collisions = collisionCount;
    updateSystemStats();
}

function displayRobotList() {
    const listContainer = document.getElementById('robotList');
    listContainer.innerHTML = '';
    
    robots.forEach(robot => {
        const robotItem = document.createElement('div');
        robotItem.className = 'robot-item';
        
        if (robot.placed) {
            robotItem.classList.add('placed');
        } else {
            robotItem.classList.add('failed');
        }
        
        const robotInfo = document.createElement('div');
        robotInfo.className = 'robot-info';
        
        const idElement = document.createElement('div');
        idElement.className = 'robot-id';
        idElement.textContent = robot.id;
        
        const sizeElement = document.createElement('div');
        sizeElement.className = 'robot-size';
        sizeElement.textContent = `${robot.width}×${robot.height}`;
        
        robotInfo.appendChild(idElement);
        robotInfo.appendChild(sizeElement);
        
        if (robot.placed) {
            const positionElement = document.createElement('div');
            positionElement.className = 'robot-position';
            positionElement.textContent = `Position: (${robot.x}, ${robot.y})`;
            robotItem.appendChild(robotInfo);
            robotItem.appendChild(positionElement);
        } else {
            robotItem.appendChild(robotInfo);
        }
        
        listContainer.appendChild(robotItem);
    });
}

function clearWarehouse() {
    if (confirm('Clear all robots from warehouse?\nThis action cannot be undone.')) {
        robots = [];
        placedRobots = [];
        systemStats.totalRobots = 0;
        systemStats.placedRobots = 0;
        systemStats.efficiency = 0;
        systemStats.collisions = 0;
        
        document.getElementById('jsonInput').value = '';
        clearPlacements();
        displayRobotList();
        updateSystemStats();
        updateGridInfo();
        
        showNotification('Warehouse cleared successfully', 'success');
    }
}

function exportLayout() {
    const layout = {
        gridSize: { width: gridSize, height: gridSize },
        robots: placedRobots.map(robot => ({
            id: robot.id,
            dimensions: { width: robot.width, height: robot.height },
            position: { x: robot.x, y: robot.y },
            defective: robot.defective
        })),
        statistics: systemStats,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `warehouse_layout_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Layout exported successfully', 'success');
}

function toggleAI() {
    const responses = [
        `CyberCore AI: ${systemStats.placedRobots} robots optimally positioned`,
        `System efficiency at ${systemStats.efficiency}% - Performance nominal`,
        `Defective robot protocols active - Containment secure`,
        `Grid utilization optimal - No collisions detected`,
        `Warehouse capacity: ${gridSize * gridSize} units available`,
        `Recommendation: Increase grid size for better efficiency`,
        `All defective units contained and catalogued`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    showNotification(randomResponse, 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const content = document.getElementById('notificationContent');
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': '🤖'
    };
    
    content.innerHTML = `${icons[type]} ${message}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function updateSystemStats() {
    document.getElementById('totalRobots').textContent = systemStats.totalRobots;
    document.getElementById('placedRobots').textContent = systemStats.placedRobots;
    document.getElementById('efficiency').textContent = systemStats.efficiency + '%';
    document.getElementById('collisions').textContent = systemStats.collisions;
    
    const bars = document.querySelectorAll('.performance-fill');
    if (bars.length >= 4) {
        bars[0].style.width = Math.min(100, (systemStats.totalRobots / 20) * 100) + '%';
        bars[1].style.width = systemStats.totalRobots > 0 ? 
            (systemStats.placedRobots / systemStats.totalRobots) * 100 + '%' : '0%';
        bars[2].style.width = systemStats.efficiency + '%';
        bars[3].style.width = Math.min(100, systemStats.collisions * 10) + '%';
    }
}
