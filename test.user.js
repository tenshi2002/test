// ==UserScript==
// @name         Gota Skin Gallery ali
// @namespace    testinggggggggg
// @version      2.1
// @description  gg
// @author       Tenshi
// @match        *://*.gota.io/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @downloadURL  https://raw.githubusercontent.com/tenshi2002/test/main/test.user.js
// @updateURL    https://raw.githubusercontent.com/tenshi2002/test/main/test.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Configuration defaults
    const PATH1_MIN_DELAY = 755; // Minimum delay for Triple split 16x16 split for 1 single piece
    const PATH2_MIN_DELAY = 785; // Minimum delay for 16x16 split
    const PATH3_MIN_DELAY = 800; // Minimum delay for 16x256 split
    const PATH4_MIN_DELAY = 815; // Minimum delay for Penta Split 32x32 split
    const PATH5_MIN_DELAY = 830; // Minimum delay for Octo Split 32x256 split
    const EDGE_TOUCH_DISTANCE = 1; // Distance for "touching" the edge in pixels
    const BASE_DISTANCE = 15; // Base threshold for "close" (in pixels)

    const defaultConfig = {
        hotkeyPentaSplit: '3',
        hotkeyOctoSplit: '4',
        hotkeyTripleSplit: '5',
        hotkey16x256Split: '6',  // Add the new hotkey here
        hotkey16x16Long: '7', // Add this line
        hotkey16xSplit: '8', // New hotkey for 16x split
        hotkey32xSplit: '9', // New hotkey for 32x split

    };

    // Load configuration from localStorage or use defaults
    const config = {
        hotkeyPentaSplit: localStorage.getItem('hotkeyPentaSplit') || defaultConfig.hotkeyPentaSplit,
        hotkeyOctoSplit: localStorage.getItem('hotkeyOctoSplit') || defaultConfig.hotkeyOctoSplit,
        hotkeyTripleSplit: localStorage.getItem('hotkeyTripleSplit') || defaultConfig.hotkeyTripleSplit,
        hotkey16x256Split: localStorage.getItem('hotkey16x256Split') || defaultConfig.hotkey16x256Split,
        hotkey16x16Long: localStorage.getItem('hotkey16x16Long') || defaultConfig.hotkey16x16Long,
        hotkey16xSplit: localStorage.getItem('hotkey16xSplit') || defaultConfig.hotkey16xSplit, // Load new hotkey
        hotkey32xSplit: localStorage.getItem('hotkey32xSplit') || defaultConfig.hotkey32xSplit, // Load new hotkey

    };

    // Function to simulate a spacebar press
    function simulateSpacebarPress() {
        const eventDown = new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            keyCode: 32,
            which: 32,
            bubbles: true
        });
        document.dispatchEvent(eventDown);

        const eventUp = new KeyboardEvent('keyup', {
            key: ' ',
            code: 'Space',
            keyCode: 32,
            which: 32,
            bubbles: true
        });
        document.dispatchEvent(eventUp);
    }

    // Function to perform a 16x split (4 rapid spacebar presses)
function perform16xSplit() {
    console.log("Performing 16x Split");
    for (let i = 0; i < 4; i++) {
        simulateSpacebarPress();
    }
}

// Function to perform a 32x split (5 rapid spacebar presses)
function perform32xSplit() {
    console.log("Performing 32x Split");
    for (let i = 0; i < 5; i++) {
        simulateSpacebarPress();
    }
}

    // Function to perform a penta split (5 rapid spacebar presses)
    function performPentaSplit() {
        console.log("Performing Penta Split");
        for (let i = 0; i < 5; i++) {
            simulateSpacebarPress();
        }
    }

    // Function to perform an octo split (8 rapid spacebar presses)
    function performOctoSplit() {
        console.log("Performing Octo Split");
        for (let i = 0; i < 8; i++) {
            simulateSpacebarPress();
        }
    }

        // Function to perform a triple split (4 rapid spacebar presses)
    function performTripleSplit() {
        console.log("Performing First Phase of Triple Split (4x split)");
        for (let i = 0; i < 4; i++) {
            simulateSpacebarPress();
        }
    }

    // Function to perform a 16x256 split
    function perform16x256Split() {
        console.log("Performing 16x256 Split (4x split followed by 8x split)");

        // Perform the first phase: 4 spacebar presses
        for (let i = 0; i < 4; i++) {
            simulateSpacebarPress();
        }

        // Calculate the delay based on the special delay logic
        let delay = calculateTotalDelay(true, PATH3_MIN_DELAY);

        // Set a timeout to perform the second phase: 8 spacebar presses
        setTimeout(function() {
            for (let i = 0; i < 8; i++) {
                simulateSpacebarPress();
            }
        }, delay);
    }

    function perform16x16LongSplit() {
        console.log("Performing 16x16 Long Split");
        for (let i = 0; i < 4; i++) {
            simulateSpacebarPress();
        }

        let delay = calculateTotalDelay(false, PATH4_MIN_DELAY); // Use path 1

        setTimeout(function() {
            for (let i = 0; i < 4; i++) {
                simulateSpacebarPress();
            }
        }, delay);
    }

    // Function to get your team's cells' positions (needs actual implementation)
    function getYourCells() {
        return []; // Implement logic to retrieve your cells' positions from the game
    }

    // Function to get other player cells' positions (needs actual implementation)
    function getOtherPlayerCells() {
        return []; // Implement logic to retrieve other players' cell positions from the game
    }

    // Function to get the distance between the edges of two cells
    function getEdgeDistance(cell1, cell2) {
        let centerDistance = Math.sqrt(Math.pow(cell2.x - cell1.x, 2) + Math.pow(cell2.y - cell1.y, 2));
        let edgeDistance = centerDistance - cell1.radius - cell2.radius;
        return edgeDistance;
    }

    // Function to calculate delay based on proximity to other cells
    function calculateProximityBasedDelay(minDelay) {
        console.log('Calculating delay based on proximity to other cells...');
        let otherCells = getOtherPlayerCells();
        if (otherCells.length === 0) {
            console.warn('No other player cells found. Using default minimum delay.');
            return minDelay;
        }

        let yourCells = getYourCells();
        if (yourCells.length === 0) {
            console.warn('No your cells found. Using default minimum delay.');
            return minDelay;
        }

        let minEdgeDistance = Infinity;

        for (let cell of yourCells) {
            for (let otherCell of otherCells) {
                let edgeDistance = getEdgeDistance(cell, otherCell);
                if (edgeDistance < minEdgeDistance) {
                    minEdgeDistance = edgeDistance;
                }
            }
        }

        let delay;
        if (minEdgeDistance <= EDGE_TOUCH_DISTANCE) {
            delay = minDelay;
        } else if (minEdgeDistance <= BASE_DISTANCE) {
            delay = minDelay + (BASE_DISTANCE - minEdgeDistance) * (minDelay / BASE_DISTANCE);
        } else {
            delay = minDelay;
        }

        console.log(`Calculated delay: ${delay} milliseconds`);
        return delay;
    }

    // Function to calculate additional delay based on mass
    function calculateMassBasedDelay() {
        console.log('Calculating delay based on mass...');
        let yourCells = getYourCells();
        if (yourCells.length === 0) {
            console.warn('No your cells found. Cannot calculate mass-based delay.');
            return 0;
        }

        let totalMass = yourCells.reduce((sum, cell) => sum + cell.mass, 0);

        let massBasedDelay = totalMass / 5;
        console.log(`Calculated mass-based delay: ${massBasedDelay} milliseconds`);
        return massBasedDelay;
    }

    // Function to calculate total delay based on proximity and mass
    function calculateTotalDelay(isTripleSplit, minDelay) {
        let proximityDelay = calculateProximityBasedDelay(minDelay);
        let massDelay = calculateMassBasedDelay();
        let totalDelay = Math.max(minDelay, proximityDelay + massDelay);
        console.log(`Total calculated delay: ${totalDelay} milliseconds`);
        return totalDelay;
    }

        // Manage intervals
    let actionTimeout = null;
    let isScriptRunning = false;
    let lastActionTime = 0; // To keep track of the last action time
    let intervalId = null; // Interval ID for periodic updates

    function startPentaSplit() {
        if (isScriptRunning) return;
        console.log("Starting Penta Split");
        isScriptRunning = true;

        performPentaSplit();
        lastActionTime = Date.now(); // Update last action time

        let delay = calculateTotalDelay(false, PATH4_MIN_DELAY);

        if (actionTimeout) clearTimeout(actionTimeout);

        actionTimeout = setTimeout(function() {
            performPentaSplit();
            isScriptRunning = false;
        }, delay);
    }

    function startOctoSplit() {
        if (isScriptRunning) return;
        console.log("Starting Fast Feed 2 (32x256)");
        isScriptRunning = true;

        performPentaSplit();
        lastActionTime = Date.now(); // Update last action time

        let delay = calculateTotalDelay(false, PATH5_MIN_DELAY);

        setTimeout(function() {
            console.log("Waiting until barely touching other cells...");
            performOctoSplit();
            isScriptRunning = false;
        }, delay);
    }

    function startTripleSplit() {
        if (isScriptRunning) return;
        console.log("Starting Triple Split (16x16)");
        isScriptRunning = true;

        performTripleSplit();
        lastActionTime = Date.now(); // Update last action time

        let delay = calculateTotalDelay(true, PATH1_MIN_DELAY);

        if (actionTimeout) clearTimeout(actionTimeout);

        actionTimeout = setTimeout(function() {
            performTripleSplit();
            isScriptRunning = false;
        }, delay);
    }

    function start16x256Split() {
        if (isScriptRunning) return;
        console.log("Starting 16x256 Split");
        isScriptRunning = true;

        perform16x256Split();
        lastActionTime = Date.now(); // Update last action time

        let delay = calculateTotalDelay(false, PATH3_MIN_DELAY);

        if (actionTimeout) clearTimeout(actionTimeout);

        actionTimeout = setTimeout(function() {
            perform16x256Split();
            isScriptRunning = false;
        }, delay);
    }

    function start16x16LongSplit() {
        if (isScriptRunning) return;
        console.log("Starting 16x16 Long Split");
        isScriptRunning = true;

        perform16x16LongSplit();
        lastActionTime = Date.now(); // Update last action time

        let delay = calculateTotalDelay(false, PATH2_MIN_DELAY);

        if (actionTimeout) clearTimeout(actionTimeout);

        actionTimeout = setTimeout(function() {
            perform16x16LongSplit();
            isScriptRunning = false;
        }, delay);
    }

    function handleRespawn() {
        console.log('Handling respawn');
        if (actionTimeout) clearTimeout(actionTimeout);
        isScriptRunning = false;
    }

    function createUI() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '10px';
        overlay.style.right = '10px';
        overlay.style.backgroundColor = '#faebff'; // Set the background color to a shade
        overlay.style.color = '#a28ca9';
        overlay.style.padding = '3px';
        overlay.style.borderRadius = '5px';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'none'; // Initially hidden
        overlay.style.fontWeight = 'bold'; // Make the text bold
        overlay.style.fontSize = '16px'; // Increase the font size
        overlay.style.textShadow = '0 0 0px black'; // Add a text shadow
        overlay.style.outline = '0px solid black'; // Add a black border to the text
        overlay.style.webkitTextStroke = '0px black'; // Add a black outline to the text
        overlay.id = 'settings-overlay';
        overlay.innerHTML = `
             <p style="font-size: 12px; color: #a28ca9; text-align: center; margin-bottom: 4px;"> Made by Tenshi</p>
        <div>
            <label>&nbsp;&nbsp;32x32 Split&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="hotkey-input-penta-split" value="${config.hotkeyPentaSplit}"></label>
        </div>
        <div>
            <label>&nbsp;&nbsp;32x256 Split&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="hotkey-input-octo-split" value="${config.hotkeyOctoSplit}"></label>
        </div>
        <div>
            <label>&nbsp;&nbsp;(1) piece feed (16x16)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="hotkey-input-triple-split" value="${config.hotkeyTripleSplit}"></label>
        </div>
        <div>
            <label>&nbsp;&nbsp;Test - 16x256 Split&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input type="text" id="hotkey-input-16x256-split" value="${config.hotkey16x256Split}"></label>
        </div>
        <div>
            <label>&nbsp;&nbsp;Test -  16x16 Split&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input type="text" id="hotkey-input-16x16-long-split" value="${config.hotkey16x16Long}"></label>
        </div>
        <div>
            <label>&nbsp;&nbsp;16x Split&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="hotkey-input-16x-split" value="${config.hotkey16xSplit}"></label>
        </div>
        <div>
            <label>&nbsp;&nbsp;32x Split&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="hotkey-input-32x-split" value="${config.hotkey32xSplit}"></label>
        </div>
        <button id="save-settings">Save Settings</button>
        <div id="status"></div>
        <p style="font-size: 12px; color: #ff3307; text-align: center; margin-bottom: 10px;">TEST SCRIPT - not guaranteed to always work.</p>
        `;

        document.body.appendChild(overlay);

        // Add event listener for the Save Settings button
        document.getElementById('save-settings').addEventListener('click', function() {
            const hotkeyPentaSplit = document.getElementById('hotkey-input-penta-split').value;
            const hotkeyOctoSplit = document.getElementById('hotkey-input-octo-split').value;
            const hotkeyTripleSplit = document.getElementById('hotkey-input-triple-split').value;
            const hotkey16x256Split = document.getElementById('hotkey-input-16x256-split').value;
            const hotkey16x16Long = document.getElementById('hotkey-input-16x16-long-split').value;
            const hotkey16xSplit = document.getElementById('hotkey-input-16x-split').value; // New hotkey
            const hotkey32xSplit = document.getElementById('hotkey-input-32x-split').value; // New hotkey


            localStorage.setItem('hotkeyPentaSplit', hotkeyPentaSplit);
            localStorage.setItem('hotkeyOctoSplit', hotkeyOctoSplit);
            localStorage.setItem('hotkeyTripleSplit', hotkeyTripleSplit);
            localStorage.setItem('hotkey16x256Split', hotkey16x256Split);
            localStorage.setItem('hotkey16x16Long', hotkey16x16Long);
            localStorage.setItem('hotkey16xSplit', hotkey16xSplit); // Save new hotkey
            localStorage.setItem('hotkey32xSplit', hotkey32xSplit); // Save new hotkey

            // Update the config object
            config.hotkeyPentaSplit = hotkeyPentaSplit;
            config.hotkeyOctoSplit = hotkeyOctoSplit;
            config.hotkeyTripleSplit = hotkeyTripleSplit;
            config.hotkey16x256Split = hotkey16x256Split;
            config.hotkey16x16Long = hotkey16x16Long;
            config.hotkey16xSplit = hotkey16xSplit; // Update new hotkey
            config.hotkey32xSplit = hotkey32xSplit; // Update new hotkey

            // Show status message
            document.getElementById('status').innerText = 'Settings saved!';
            setTimeout(() => {
                document.getElementById('status').innerText = '';
            }, 2000);
        });
    }


    createUI();

    document.addEventListener('visibility change', function() {
        if (document.visibilityState === 'hidden') {
            // Handle tab switch
            console.log('Tab is hidden');
        } else {
            // Handle tab return
            console.log('Tab is visible');
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'g') {
            const overlay = document.getElementById('settings-overlay');
            if (overlay) {
                overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
            }
        }

        if (event.key === config.hotkeyPentaSplit) {
            startPentaSplit();
        }

        if (event.key === config.hotkeyOctoSplit) {
            startOctoSplit();
        }

        if (event.key === config.hotkeyTripleSplit) {
            startTripleSplit();
        }

        if (event.key === config.hotkey16x256Split) {
            start16x256Split();
        }

        if (event.key === config.hotkey16x16Long) {
            start16x16LongSplit();
        }

         if (event.key === config.hotkey16xSplit) { // New hotkey for 16x split
        perform16xSplit();
    }

    if (event.key === config.hotkey32xSplit) { // New hotkey for 32x split
        perform32xSplit();
    }

    });
    console.log("BETA Fast Feed Hotkeys script is active. Press 'Ctrl +g' to toggle the settings overlay.");
})();
