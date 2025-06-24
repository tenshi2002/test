// ==UserScript==
// @name         Gota Skin Gallery 
// @namespace    testingggggggggaaaa
// @version      2.3
// @description  ggggg
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

(function () {
    'use strict';

    // --- Robust Ad Removal ---
    function removeAdBox() {
      // Remove main ad panel
      var adBox = document.getElementById("main-rb");
      if (adBox) adBox.remove();
      // Remove ad slot if injected later
      var adSlot = document.getElementById("GOT_gota-io_336x280");
      if (adSlot) adSlot.remove();
    }
    // Remove ad box as soon as DOM is ready (extra safety)
    document.addEventListener("DOMContentLoaded", removeAdBox);
    // Run once on DOMContentLoaded and also periodically in case ads are injected later
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", removeAdBox);
    } else {
      removeAdBox();
    }
    setInterval(removeAdBox, 2000); // Remove again every 2s just in case
    // CSS fallback to hide ad panels and collapse space
    const adStyle = document.createElement('style');
    adStyle.textContent = `
      #main-rb, #GOT_gota-io_336x280 {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
      }
      /* Collapse left panel if empty */
      #main .main-left:empty {
        display: none !important;
        width: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
      }
    `;
    document.head.appendChild(adStyle);

    const style = document.createElement('style');
    style.textContent = `
      #skinBox {
        position: absolute;
        top: 11px;
        left: 181px;
        width: 600px;
        height: 355px;
        max-width: 100vw;
        max-height: 100vh;
        min-width: 320px;
        min-height: 200px;
        background-color: rgba(100, 100, 100, 0.3);
        border: 2px solid gray;
        box-sizing: border-box;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        overflow: hidden;
      }

      .circle-grid-container {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;
      }

      .circle-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, 122px);
        grid-auto-rows: 166px;
        gap: 20px;
        width: 100%;
        justify-content: start;
      }

      .skin-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        user-select: none;
      }

      .circle-slot {
        width: 122px;
        height: 122px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff3b3b, #3bff3b, #3b3bff, #ffe53b, #ff993b, #b13bff, #ff3b3b);
        border: 2px dashed white;
        margin-bottom: 7px;
        flex-shrink: 0;
        /* Remove animation from base class for perf */
        background-size: 400% 400%;
        background-position: 100% 50%;
      }
      .circle-slot.animated-bg {
        animation: cell-rgb-breath 16s linear infinite;
      }
      @keyframes cell-rgb-breath {
        0%   { background-position: 100% 50%; }
        43.75% { background-position: 0% 50%; } /* 7s of 16s */
        50%  { background-position: 0% 50%; }   /* 1s pause */
        93.75% { background-position: 100% 50%; } /* 7s back */
        100% { background-position: 100% 50%; }  /* 1s pause */
      }
      .circle-slot.favorite {
        /* Add a thin gold outline and show badge */
        position: relative;
        border: 2px solid #ffd600;
        box-shadow: 0 0 0 1px #fffbe6;
      }
      #skinBox .circle-slot .favorite-star {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 26px;
        color: #ffd600;
        text-shadow: 0 2px 8px #fffbe6, 0 0 2px #ffd600;
        pointer-events: none;
        z-index: 10;
        filter: drop-shadow(0 0 2px #fffbe6);
        animation: favorite-star-pop 0.5s cubic-bezier(.5,1.8,.5,1) 1;
        display: block !important;
      }
      @keyframes favorite-star-pop {
        0% { transform: scale(0.7) rotate(-20deg); opacity: 0.2; }
        60% { transform: scale(1.2) rotate(10deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      .skin-name {
        max-width: 80px;
        text-align: left;
        font-size: 12px;
        color: white;
        background: rgba(0,0,0,0.4);
        border-radius: 4px;
        padding: 2px 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 0;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .skin-name.copied {
        background: #1976d2;
        color: #fff;
      }

      /* Hide gallery if it would overlap a critical menu (example: #hud) */
      #skinBox.overlap-warning {
        border: 2px solid #e53935;
        box-shadow: 0 0 16px #e53935;
      }

      /* Resize handle */
      #skinBox .resize-handle {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 18px;
        height: 18px;
        background: rgba(255,255,255,0.2);
        border-radius: 0 0 8px 0;
        cursor: se-resize;
        z-index: 10002;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
      }
      #skinBox .resize-handle:after {
        content: '';
        display: block;
        width: 12px;
        height: 12px;
        border-right: 2px solid #aaa;
        border-bottom: 2px solid #aaa;
        margin: 2px;
        border-radius: 0 0 4px 0;
      }
    `;
    document.head.appendChild(style);

    const box = document.createElement('div');
    box.id = 'skinBox';

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'circle-grid-container';

    const grid = document.createElement('div');
    grid.className = 'circle-grid';

    for (let i = 0; i < 44; i++) {
      const slot = document.createElement('div');
      slot.className = 'skin-slot';

      const circle = document.createElement('div');
      circle.className = 'circle-slot';
      circle.style.width = '122px';
      circle.style.height = '122px';

      const infoRow = document.createElement('div');
      infoRow.className = 'info-row';

      const name = document.createElement('div');
      name.className = 'skin-name';
      name.textContent = `Skin ${i + 1}`;

      const button = document.createElement('div');
      button.className = 'use-button';
      button.textContent = 'USE';

      infoRow.appendChild(name);
      infoRow.appendChild(button);

      slot.appendChild(circle);
      slot.appendChild(infoRow);
      grid.appendChild(slot);
    }

    scrollContainer.appendChild(grid);
    box.appendChild(scrollContainer);
    document.body.appendChild(box);


    // Create new styled toggle for add skin functionality
    const advToggle = document.createElement('div');
    advToggle.style.display = 'flex';
    advToggle.style.alignItems = 'center';
    advToggle.style.gap = '6px';
    advToggle.style.padding = '0 10px';
    advToggle.style.cursor = 'pointer';
    advToggle.style.userSelect = 'none';
    advToggle.style.color = '#bbb';
    advToggle.style.fontSize = '13px';
    advToggle.style.marginTop = '2px';

    const advArrow = document.createElement('span');
    advArrow.textContent = '\u25B6'; // Right arrow (▶)
    advArrow.style.transition = 'transform 0.2s';

    const advLabel = document.createElement('span');
    advLabel.textContent = 'add skin';

    advToggle.appendChild(advArrow);
    advToggle.appendChild(advLabel);

    // Insert above the inputContainer (where toggleContainer was)
    box.appendChild(advToggle);

    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '8px';
    inputContainer.style.alignItems = 'center';
    inputContainer.style.padding = '10px';
    inputContainer.style.background = 'rgba(0,0,0,0.2)';

    // Remove old input fields
    // Create new single input for skin name and uuid
    const skinInput = document.createElement('input');
    skinInput.type = 'text';
    skinInput.placeholder = 'Skin Name | UUID or URL';
    skinInput.style.flex = '1';
    skinInput.style.padding = '4px';
    skinInput.style.borderRadius = '4px';
    skinInput.style.border = '1px solid #ccc';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add to Favorites';
    addButton.style.padding = '4px 10px';
    addButton.style.borderRadius = '4px';
    addButton.style.border = 'none';
    addButton.style.background = '#4caf50';
    addButton.style.color = 'white';
    addButton.style.cursor = 'pointer';

    // Remove old input fields from inputContainer
    inputContainer.innerHTML = '';
    inputContainer.appendChild(skinInput);
    inputContainer.appendChild(addButton);

    inputContainer.style.display = 'flex'; // ensure visible by default
    box.appendChild(inputContainer);

    // By default, hide the input section and rotate the arrow
    let inputVisible = false;
    inputContainer.style.display = 'none';
    advArrow.style.transform = 'rotate(-90deg)';
    advToggle.addEventListener('click', () => {
      inputVisible = !inputVisible;
      inputContainer.style.display = inputVisible ? 'flex' : 'none';
      advArrow.style.transform = inputVisible ? 'rotate(0deg)' : 'rotate(-90deg)';
    });

    // --- PROFILE STORAGE REFACTOR ---
    // Store profiles as an array of objects: [{ name, skins }]
    const PROFILE_KEY = 'gotaio_profiles_v2';
    const PROFILE_IDX_KEY = 'gotaio_last_profile_idx';
    let profiles = [];
    let currentProfileIdx = 0;

    // Use Tampermonkey GM_* APIs for cross-domain profile storage
    async function loadProfiles() {
        if (typeof GM_getValue === 'function') {
            const data = await GM_getValue(PROFILE_KEY);
            if (data) {
                try {
                    profiles = JSON.parse(data);
                    if (!Array.isArray(profiles)) throw new Error('Invalid format');
                } catch (e) {
                    profiles = [{ name: 'Default', skins: [] }];
                }
            } else {
                profiles = [{ name: 'Default', skins: [] }];
            }
        } else {
            // fallback to localStorage for non-Tampermonkey environments
            const data = localStorage.getItem(PROFILE_KEY);
            if (data) {
                try {
                    profiles = JSON.parse(data);
                    if (!Array.isArray(profiles)) throw new Error('Invalid format');
                } catch (e) {
                    profiles = [{ name: 'Default', skins: [] }];
                }
            } else {
                profiles = [{ name: 'Default', skins: [] }];
            }
        }
        // Defensive: ensure all profiles have name and skins
        profiles = profiles.map(p => ({
            name: typeof p.name === 'string' ? p.name : 'Default',
            skins: Array.isArray(p.skins) ? p.skins : []
        }));
    }

    async function saveProfiles() {
        if (typeof GM_setValue === 'function') {
            await GM_setValue(PROFILE_KEY, JSON.stringify(profiles));
        } else {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
        }
    }

    async function loadProfileIdx() {
        if (typeof GM_getValue === 'function') {
            const idx = await GM_getValue(PROFILE_IDX_KEY);
            currentProfileIdx = typeof idx === 'number' ? idx : 0;
        } else {
            const idx = localStorage.getItem(PROFILE_IDX_KEY);
            currentProfileIdx = idx ? parseInt(idx, 10) : 0;
        }
    }

    async function saveProfileIdx() {
        if (typeof GM_setValue === 'function') {
            await GM_setValue(PROFILE_IDX_KEY, currentProfileIdx);
        } else {
            localStorage.setItem(PROFILE_IDX_KEY, currentProfileIdx);
        }
    }

    function updateProfileSelect() {
      profileDropdown.innerHTML = '';
      profiles.forEach((profile, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = profile.name;
        if (idx === currentProfileIdx) opt.selected = true;
        profileDropdown.appendChild(opt);
      });
      // Always set dropdown value to currentProfileIdx
      profileDropdown.value = String(currentProfileIdx);
      saveProfileIdx();
    }

    const profileSelector = document.createElement('div');
    profileSelector.style.position = 'absolute';
    profileSelector.style.top = '10px';
    profileSelector.style.right = '10px';
    profileSelector.style.zIndex = '9999';
    profileSelector.style.color = 'white';

    const profileDropdown = document.createElement('select');
    profileDropdown.style.padding = '2px';
    profileDropdown.style.border = '1px solid white';
    profileDropdown.style.backgroundColor = 'rgba(0,0,0,0.5)';
    profileDropdown.style.color = 'white';
    profileDropdown.style.borderRadius = '4px';
    profileDropdown.style.fontSize = '12px';

    // Remove the default option (you can add more later)
    // const defaultOption = document.createElement('option');
    // defaultOption.value = 'default';
    // defaultOption.textContent = 'default';
    // profileDropdown.appendChild(defaultOption);

    // Replace addProfileButton with editProfileButton and menu
    const editProfileButton = document.createElement('button');
    editProfileButton.textContent = '🛠️';
    editProfileButton.title = 'Edit profiles';
    editProfileButton.style.marginLeft = '5px';
    editProfileButton.style.background = '#4caf50';
    editProfileButton.style.color = 'white';
    editProfileButton.style.border = 'none';
    editProfileButton.style.borderRadius = '4px';
    editProfileButton.style.cursor = 'pointer';
    editProfileButton.style.fontSize = '15px';
    profileSelector.appendChild(editProfileButton);

    // Remove old addProfileButton and deleteProfileButton if present
    if (typeof addProfileButton !== 'undefined' && addProfileButton.parentNode) addProfileButton.remove();
    if (typeof deleteProfileButton !== 'undefined' && deleteProfileButton.parentNode) deleteProfileButton.remove();

    // Create the dropdown menu
    const profileMenu = document.createElement('div');
    profileMenu.style.position = 'absolute';
    profileMenu.style.top = '32px';
    profileMenu.style.right = '0';
    profileMenu.style.background = 'rgba(40,40,40,0.98)';
    profileMenu.style.color = 'white';
    profileMenu.style.borderRadius = '8px';
    profileMenu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    profileMenu.style.padding = '6px 0';
    profileMenu.style.display = 'none';
    profileMenu.style.fontSize = '14px';
    profileSelector.appendChild(profileMenu);

    // Create all menu options first
    const addOption = document.createElement('div');
    addOption.textContent = 'Add Profile';
    addOption.style.padding = '8px 18px';
    addOption.style.cursor = 'pointer';
    addOption.addEventListener('mouseenter', () => addOption.style.background = 'rgba(76,175,80,0.18)');
    addOption.addEventListener('mouseleave', () => addOption.style.background = '');
    addOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      showModal({
        title: 'Add Profile',
        message: 'Enter new profile name:',
        input: { placeholder: 'Profile name' },
        confirmText: 'Add',
        cancelText: 'Cancel',
        onConfirm: (name) => {
          if (!name) return;
          if (profiles.some(p => p.name === name)) {
            showModal({
              title: 'Duplicate Profile Name',
              message: 'You already have a profile with that name. (Both will be kept)',
              confirmText: 'OK',
              cancelText: null, // Remove cancel button
              onConfirm: () => {}
            });
            return;
          }
          profiles.push({ name: { name }, skins: [] });
          currentProfileIdx = profiles.length - 1;
          saveProfiles();
          updateProfileSelect();
          renderSkins();
        }
      });
    });

    // --- RENAME PROFILE OPTION ---
    const renameOption = document.createElement('div');
    renameOption.textContent = 'Rename Profile';
    renameOption.style.padding = '8px 18px';
    renameOption.style.cursor = 'pointer';
    renameOption.addEventListener('mouseenter', () => renameOption.style.background = 'rgba(255,193,7,0.18)');
    renameOption.addEventListener('mouseleave', () => renameOption.style.background = '');
    renameOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      const currentProfile = profiles[currentProfileIdx];
      if (!currentProfile) return;
      showModal({
        title: 'Rename Profile',
        message: 'Enter new name for this profile:',
        input: { placeholder: 'New profile name', value: currentProfile.name },
        confirmText: 'Rename',
        cancelText: 'Cancel',
        onConfirm: (newName) => {
          if (!newName) return;
          currentProfile.name = newName;
          saveProfiles();
          updateProfileSelect();
          renderSkins();
        }
      });
    });

    const delOption = document.createElement('div');
    delOption.textContent = 'Delete Profile';
    delOption.style.padding = '8px 18px';
    delOption.style.cursor = 'pointer';
    delOption.addEventListener('mouseenter', () => delOption.style.background = 'rgba(211,47,47,0.18)');
    delOption.addEventListener('mouseleave', () => delOption.style.background = '');
    // Remove any duplicate delOption event listeners before adding
    if (delOption._deleteListener) delOption.removeEventListener('click', delOption._deleteListener);
    delOption._deleteListener = function() {
      profileMenu.style.display = 'none';
      deleteProfileWithConfirmation();
    };
    delOption.addEventListener('click', delOption._deleteListener);

    const exportOption = document.createElement('div');
    exportOption.textContent = 'Share Profile';
    exportOption.style.padding = '8px 18px';
    exportOption.style.cursor = 'pointer';
    exportOption.addEventListener('mouseenter', () => exportOption.style.background = 'rgba(33,150,243,0.18)');
    exportOption.addEventListener('mouseleave', () => exportOption.style.background = '');
    exportOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      const profile = profiles[currentProfileIdx];
      if (!profile) {
        showModal({
          title: 'No Profile Selected',
          message: 'No profile selected to share.',
          confirmText: 'OK',
          cancelText: null,
          onConfirm: () => {}
        });
        return;
      }
      const dataStr = JSON.stringify({ name: profile.name, skins: profile.skins }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gotaio_profile_${profile.name}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    });

    const importOption = document.createElement('div');
    importOption.textContent = 'Import Profiles';
    importOption.style.padding = '8px 18px';
    importOption.style.cursor = 'pointer';
    importOption.addEventListener('mouseenter', () => importOption.style.background = 'rgba(255,193,7,0.18)');
    importOption.addEventListener('mouseleave', () => importOption.style.background = '');
    importOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.style.display = 'none';
      input.addEventListener('change', (e) => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const imported = JSON.parse(evt.target.result);
            if (!imported.name || !Array.isArray(imported.skins)) throw new Error('Invalid format');
            if (profiles.some(p => p.name === imported.name)) {
              showModal({
                title: 'Duplicate Profile Name',
                message: 'You already have a profile with that name. (Both will be kept)',
                confirmText: 'OK',
                cancelText: null,
                onConfirm: () => {}
              });
            }
            profiles.push({ name: imported.name, skins: imported.skins });
            currentProfileIdx = profiles.length - 1;
            saveProfiles();
            updateProfileSelect();
            renderSkins();
            showNotification('Profile imported!', 'green');
          } catch (err) {
            showModal({
              title: 'Import Failed',
              message: 'Failed to import: ' + err.message,
              confirmText: 'OK',
              cancelText: null,
              onConfirm: () => {}
            });
          }
        };
        reader.readAsText(file);
      });
      document.body.appendChild(input);
      input.click();
      setTimeout(() => document.body.removeChild(input), 1000);
    });

    // Now append all options in order
    profileMenu.appendChild(addOption);
    profileMenu.appendChild(renameOption);
    profileMenu.appendChild(delOption);
    profileMenu.appendChild(exportOption);
    profileMenu.appendChild(importOption);

    // Show/hide menu on editProfileButton click
    editProfileButton.addEventListener('click', (e) => {
      profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
      e.stopPropagation();
    });
    // Hide menu when clicking outside
    window.addEventListener('mousedown', (e) => {
      if (!profileMenu.contains(e.target) && e.target !== editProfileButton) {
        profileMenu.style.display = 'none';
      }
    });

    // Append dropdown and button to container
    profileSelector.appendChild(profileDropdown);
    profileSelector.appendChild(editProfileButton);

    // Append the whole UI somewhere, e.g. to document.body or your custom box
    // You can append to box or document.body as needed
    box.appendChild(profileSelector);

    profileDropdown.addEventListener('change', () => {
      currentProfileIdx = parseInt(profileDropdown.value, 10);
      saveProfileIdx();
      renderSkins();
    });

    // DRY: Single function for deleting a profile with confirmation
    function deleteProfileWithConfirmation() {
      if (profiles.length <= 1) {
        showModal({
          title: 'Cannot Delete Profile',
          message: 'You cannot delete the last profile.',
          confirmText: 'OK',
          cancelText: null,
          onConfirm: () => {}
        });
        return;
      }
      showModal({
        title: 'Delete Profile',
        message: `Are you sure you want to delete the profile "${profiles[currentProfileIdx].name}"<br><span style='color:#f55'>(This cannot be undone.)</span>`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
          profiles.splice(currentProfileIdx, 1);
          if (currentProfileIdx >= profiles.length) currentProfileIdx = profiles.length - 1;
          saveProfiles();
          updateProfileSelect();
          renderSkins();
        }
      });
    }

    // Delete profile logic with confirmation
    delOption.addEventListener('click', () => {
      deleteProfileWithConfirmation();
    });

    // Use modal for add profile
    addOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      showModal({
        title: 'Add Profile',
        message: 'Enter new profile name:',
        input: { placeholder: 'Profile name' },
        confirmText: 'Add',
        cancelText: 'Cancel',
        onConfirm: (name) => {
          if (!name) return;
          if (profiles.some(p => p.name === name)) {
            showModal({
              title: 'Duplicate Profile Name',
              message: 'You already have a profile with that name. (Both will be kept)',
              confirmText: 'OK',
              cancelText: null, // Remove cancel button
              onConfirm: () => {}
            });
            return;
          }
          profiles.push({ name, skins: [] });
          currentProfileIdx = profiles.length - 1;
          saveProfiles();
          updateProfileSelect();
          renderSkins();
        }
      });
    });

    // --- SORT ORDER TOGGLE ---
    const SORT_KEY = 'gotaio_skin_sort_order';
    let sortOrder = localStorage.getItem(SORT_KEY) || 'newest';
    const sortToggle = document.createElement('div');
    sortToggle.style.cursor = 'pointer';
    sortToggle.style.color = 'white';
    sortToggle.style.fontWeight = 'bold';
    sortToggle.style.fontSize = '14px';
    sortToggle.style.margin = '8px 0 4px 10px';
    function updateSortToggleText() {
      sortToggle.textContent = sortOrder === 'newest' ? '▼' : '▲';
      sortToggle.title = sortOrder === 'newest' ? 'Newest First' : 'Oldest First';
    }
    sortToggle.addEventListener('click', () => {
      sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
      localStorage.setItem(SORT_KEY, sortOrder);
      updateSortToggleText();
      renderSkins();
    });
    updateSortToggleText();

    // --- SEARCH BAR ---
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search…';
    searchInput.style.width = '90px';
    searchInput.style.marginLeft = '8px';
    searchInput.style.padding = '2px 6px';
    searchInput.style.borderRadius = '5px';
    searchInput.style.border = '1px solid #888';
    searchInput.style.fontSize = '13px';
    searchInput.style.background = 'rgba(255,255,255,0.12)';
    searchInput.style.color = 'white';
    searchInput.style.outline = 'none';
    searchInput.style.transition = 'width 0.2s';

    // 🌐 Search All Profiles Toggle
    let searchAllProfiles = false;
    const searchAllBtn = document.createElement('button');
    searchAllBtn.innerHTML = '🌐';
    searchAllBtn.style.display = 'none';
    searchAllBtn.style.background = 'none';
    searchAllBtn.style.border = 'none';
    searchAllBtn.style.fontSize = '18px';
    searchAllBtn.style.cursor = 'pointer';
    searchAllBtn.style.marginLeft = '4px';
    searchAllBtn.style.color = '#4cafef';
    searchAllBtn.title = 'Search all profiles (currently OFF)';
    function updateSearchAllBtn() {
      searchAllBtn.title = searchAllProfiles
        ? 'Searching ALL profiles (click to search only current profile)'
        : 'Search all profiles (currently OFF)';
      searchAllBtn.style.filter = searchAllProfiles ? 'drop-shadow(0 0 4px #4cafef)' : 'grayscale(0.7)';
    }
    searchAllBtn.addEventListener('click', (e) => {
      searchAllProfiles = !searchAllProfiles;
      updateSearchAllBtn();
      renderSkins();
      e.stopPropagation();
    });
    updateSearchAllBtn();

    // Prevent blur when clicking 🌐 icon
    searchAllBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Keep focus on searchInput
      searchInput.focus();
    });

    searchInput.addEventListener('focus', () => {
      searchInput.style.width = '130px';
      searchAllBtn.style.display = 'inline-block';
    });
    searchInput.addEventListener('blur', (e) => {
      // Only hide if focus is not moving to the 🌐 button
      setTimeout(() => {
        if (document.activeElement !== searchAllBtn) {
          searchInput.style.width = '90px';
          searchAllBtn.style.display = 'none';
        }
      }, 120);
    });
    // Make search realtime
    searchInput.addEventListener('input', () => {
      renderSkins();
    });
    // Place search bar next to sortToggle
    const sortBarContainer = document.createElement('div');
    sortBarContainer.style.display = 'flex';
    sortBarContainer.style.alignItems = 'center';
    sortBarContainer.style.margin = '8px 0 4px 10px';
    sortBarContainer.appendChild(sortToggle);
    sortBarContainer.appendChild(searchInput);
    sortBarContainer.appendChild(searchAllBtn);
    // Insert above the grid
    box.insertBefore(sortBarContainer, scrollContainer);

    // --- FAVORITE FILTER TOGGLE ---
    let showOnlyFavorites = false;
    const favoriteToggle = document.createElement('button');
    favoriteToggle.innerHTML = '⭐';
    favoriteToggle.title = 'Show only favorites';
    favoriteToggle.style.background = 'none';
    favoriteToggle.style.border = 'none';
    favoriteToggle.style.fontSize = '18px';
    favoriteToggle.style.margin = '0 -6px';
    favoriteToggle.style.cursor = 'pointer';
    favoriteToggle.style.color = '#ffd600';
    favoriteToggle.style.transition = 'filter 0.15s';
    // Make the favorite star icon's clickable area match the icon size exactly
    favoriteToggle.style.width = '24px';
    favoriteToggle.style.height = '24px';
    favoriteToggle.style.display = 'flex';
    favoriteToggle.style.alignItems = 'center';
    favoriteToggle.style.justifyContent = 'center';
    favoriteToggle.style.padding = '0';
    favoriteToggle.style.boxSizing = 'content-box';
    // Prevent click events from leaking outside the icon
    favoriteToggle.addEventListener('mousedown', e => e.stopPropagation());
    function updateFavoriteToggle() {
      favoriteToggle.style.filter = showOnlyFavorites ? 'drop-shadow(0 0 4px #ffd600)' : 'grayscale(0.7)';
      favoriteToggle.title = showOnlyFavorites ? 'Showing only favorites' : 'Show only favorites';
    }
    favoriteToggle.addEventListener('click', () => {
      showOnlyFavorites = !showOnlyFavorites;
      updateFavoriteToggle();
      renderSkins();
    });
    updateFavoriteToggle();
    // Insert star between search and sort arrow
    sortBarContainer.insertBefore(favoriteToggle, sortToggle);

    function setCircleSlotAnimation(enabled) {
      // Toggle the animated-bg class on all .circle-slot elements
      const slots = document.querySelectorAll('#skinBox .circle-slot');
      slots.forEach(slot => {
        if (enabled) slot.classList.add('animated-bg');
        else slot.classList.remove('animated-bg');
      });
    }

    function renderSkins() {
      // Remove any leftover drag clone before rendering
      const oldClone = document.getElementById('skin-drag-clone');
      if (oldClone) oldClone.remove();
      grid.innerHTML = '';
      let favoriteSkins;
      const search = searchInput.value.trim().toLowerCase();
      const canDrag = !search && !searchAllProfiles;
      if (searchAllProfiles && search) {
        favoriteSkins = profiles.flatMap(p => p.skins || []);
      } else {
        favoriteSkins = profiles[currentProfileIdx]?.skins || [];
      }
      // Filter by favorites if toggle is on
      if (showOnlyFavorites) {
        favoriteSkins = favoriteSkins.filter(skin => skin.favorite);
      }
      // Sort skins based on sortOrder
      if (sortOrder === 'newest') {
        favoriteSkins = [...favoriteSkins].slice().reverse();
      }
      // Filter by search and sort by relevance
      if (search) {
        favoriteSkins = favoriteSkins
          .map((skin, idx) => {
            const name = skin.name.toLowerCase();
            let relevance = 2; // default: contains
            if (name === search) relevance = 0; // exact match
            else if (name.startsWith(search)) relevance = 1; // starts with
            else if (!name.includes(search)) relevance = 99; // not a match
            return { skin, idx, relevance };
          })
          .filter(item => item.relevance !== 99)
          .sort((a, b) => {
            if (a.relevance !== b.relevance) return a.relevance - b.relevance;
            return a.idx - b.idx; // preserve original order within group
          })
          .map(item => item.skin);
      }
      let dragFromIndex = null;
      let dragTimer = null;
      let draggingSlot = null;
      let isDragActive = false;
      let dragOverIndex = null;
      let dragClone = null;
      let mouseMoveHandler = null;
      let lastTargetSlot = null;
      let dragStartOffset = {x:0, y:0};
      let dragOrigin = {x:0, y:0};
      let dragMouseDown = false;
      // --- DRAG STATE CLEANUP UTILITY ---
      function cleanupDragState() {
        clearTimeout(dragTimer);
        dragTimer = null;
        dragMouseDown = false;
        isDragActive = false;
        dragFromIndex = null;
        dragOverIndex = null;
        if (draggingSlot) draggingSlot.style.visibility = '';
        if (draggingSlot) draggingSlot.classList.remove('dragging');
        draggingSlot = null;
        if (lastTargetSlot) lastTargetSlot.classList.remove('drag-over');
        lastTargetSlot = null;
        if (mouseMoveHandler) document.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
        dragStartOffset = {x:0, y:0};
        dragOrigin = {x:0, y:0};
        // Remove all drag clones from DOM (not just the current one)
        document.querySelectorAll('#skin-drag-clone').forEach(clone => clone.remove());
        dragClone = null;
        // Unhide all slots in case any are stuck hidden
        document.querySelectorAll('.skin-slot').forEach(slot => {
          slot.style.visibility = '';
          slot.classList.remove('dragging', 'drag-over');
        });
        document.body.style.cursor = '';
      }
      for (let i = 0; i < favoriteSkins.length; i++) {
        const skin = favoriteSkins[i];
        const slot = document.createElement('div');
        slot.className = 'skin-slot';
        if (canDrag) {
          slot.setAttribute('data-index', i);
          let mouseIsDown = false;
          slot.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            mouseIsDown = true;
            dragMouseDown = true;
            // Remove any existing drag clone before starting
            cleanupDragState();
            const rect = slot.getBoundingClientRect();
            dragOrigin = { x: rect.left, y: rect.top };
            dragStartOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            dragTimer = setTimeout(() => {
              if (!mouseIsDown) return; // Only start drag if still holding
              dragFromIndex = i;
              draggingSlot = slot;
              isDragActive = true;
              slot.classList.add('dragging');
              // Create a visual clone
              dragClone = slot.cloneNode(true);
              dragClone.id = 'skin-drag-clone';
              dragClone.style.position = 'fixed';
              dragClone.style.pointerEvents = 'none';
              dragClone.style.zIndex = '100000';
              dragClone.style.opacity = '0.92';
              dragClone.style.transform = 'scale(1.08)';
              dragClone.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
              dragClone.style.transition = 'none';
              dragClone.style.left = (e.clientX - dragStartOffset.x) + 'px';
              dragClone.style.top = (e.clientY - dragStartOffset.y) + 'px';
              document.body.appendChild(dragClone);
              // Hide original
              slot.style.visibility = 'hidden';
              // Move clone with mouse
              mouseMoveHandler = function(ev) {
                if (!isDragActive || !dragClone) return;
                dragClone.style.left = (ev.clientX - dragStartOffset.x) + 'px';
                dragClone.style.top = (ev.clientY - dragStartOffset.y) + 'px';
                // Find slot under mouse
                const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
                const overSlot = elements.find(el => el.classList && el.classList.contains('skin-slot') && el !== draggingSlot);
                if (lastTargetSlot && lastTargetSlot !== overSlot) lastTargetSlot.classList.remove('drag-over');
                if (overSlot) {
                  overSlot.classList.add('drag-over');
                  dragOverIndex = parseInt(overSlot.getAttribute('data-index'), 10);
                  lastTargetSlot = overSlot;
                } else {
                  dragOverIndex = null;
                  lastTargetSlot = null;
                }
              };
              document.addEventListener('mousemove', mouseMoveHandler);
              document.body.style.cursor = 'grabbing';
            }, 120);
          });
          slot.addEventListener('mouseup', e => {
            mouseIsDown = false;
            dragMouseDown = false;
            clearTimeout(dragTimer);
            if (isDragActive) {
              finishDrag(e);
            } else {
              cleanupDragState();
            }
          });
          slot.addEventListener('mouseleave', e => {
            mouseIsDown = false;
            clearTimeout(dragTimer);
            if (!isDragActive) cleanupDragState();
          });
        }
        // ...existing code for rendering skin slot...
        const circle = document.createElement('div');
        circle.className = 'circle-slot' + (skin.favorite ? ' favorite' : '');
        // Remove static background so animated CSS background is visible
        // circle.style.background = '#222';
        circle.style.display = 'flex';
        circle.style.alignItems = 'center';
        circle.style.justifyContent = 'center';
        circle.style.overflow = 'hidden';
        circle.style.position = 'relative';

        const img = document.createElement('img');
        img.src = `https://skin-data.gota.io/${skin.uuid}.png`;
        img.alt = skin.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.onerror = function() {
          img.style.display = 'none';
        };
        circle.appendChild(img);
        // Add favorite star badge overlay if favorite (append after image for visibility)
        if (skin.favorite) {
          const star = document.createElement('span');
          star.className = 'favorite-star';
          star.textContent = '⭐';
          circle.appendChild(star);
        }

        const infoRow = document.createElement('div');
        infoRow.className = 'info-row';

        const name = document.createElement('div');
        name.className = 'skin-name';
        name.textContent = skin.name;
        name.title = 'Click to copy';
        name.addEventListener('click', () => {
          navigator.clipboard.writeText(skin.name);
          name.classList.add('copied');
          name.textContent = 'Copied!';
          setTimeout(() => {
            name.classList.remove('copied');
            name.textContent = skin.name;
          }, 900);
        });
        infoRow.appendChild(name);

        slot.appendChild(circle);
        slot.appendChild(infoRow);
        grid.appendChild(slot);

        // Skin flip logic
        slot.style.perspective = '400px';
        const flipContainer = document.createElement('div');
        flipContainer.style.width = '122px';
        flipContainer.style.height = '122px';
        flipContainer.style.position = 'relative';
        flipContainer.style.transition = 'transform 0.4s';
        flipContainer.style.transformStyle = 'preserve-3d';

        // Front (image)
        const front = document.createElement('div');
        front.style.position = 'absolute';
        front.style.width = '100%';
        front.style.height = '100%';
        front.style.backfaceVisibility = 'hidden';
        // Add image
        front.appendChild(img);
        // Add favorite star badge overlay if favorite (append after image for visibility)
        if (skin.favorite) {
          const star = document.createElement('span');
          star.className = 'favorite-star';
          star.textContent = '⭐';
          front.appendChild(star);
        }

        // Back (delete and favorite button)
        const back = document.createElement('div');
        back.style.position = 'absolute';
        back.style.width = '100%';
        back.style.height = '100%';
        back.style.background = 'rgba(30,0,0,0.8)';
        back.style.display = 'flex';
        back.style.flexDirection = 'column';
        back.style.alignItems = 'center';
        back.style.justifyContent = 'center';
        back.style.backfaceVisibility = 'hidden';
        back.style.transform = 'rotateY(180deg)';
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.padding = '8px 18px';
        delBtn.style.background = '#d32f2f';
        delBtn.style.color = 'white';
        delBtn.style.border = 'none';
        delBtn.style.borderRadius = '6px';
        delBtn.style.cursor = 'pointer';
        delBtn.style.marginBottom = '8px';
        delBtn.addEventListener('click', (ev) => {
          favoriteSkins.splice(i, 1);
          saveProfiles();
          renderSkins();
          showNotification('Skin deleted!', 'red');
          ev.stopPropagation();
        });
        back.appendChild(delBtn);
        // Favorite button
        const favBtn = document.createElement('button');
        favBtn.textContent = skin.favorite ? 'Unfavorite ⭐' : 'Favorite ⭐';
        favBtn.style.padding = '7px 18px';
        favBtn.style.background = skin.favorite ? '#ffd600' : '#444';
        favBtn.style.color = skin.favorite ? '#222' : 'white';
        favBtn.style.border = 'none';
        favBtn.style.borderRadius = '6px';
        favBtn.style.cursor = 'pointer';
        favBtn.addEventListener('click', (ev) => {
          skin.favorite = !skin.favorite;
          saveProfiles();
          renderSkins();
          ev.stopPropagation();
        });
        back.appendChild(favBtn);

        flipContainer.appendChild(front);
        flipContainer.appendChild(back);
        let flipped = false;
        let outsideFlipListener = null;
        flipContainer.addEventListener('click', (ev) => {
          flipped = !flipped;
          flipContainer.style.transform = flipped ? 'rotateY(180deg)' : '';
          ev.stopPropagation();
          // If flipping open, set up outside click listener
          if (flipped) {
            // Close any other flipped cards
            document.querySelectorAll('.skin-slot .flip-open').forEach(el => {
              if (el !== flipContainer) {
                el.classList.remove('flip-open');
                el.style.transform = '';
                el._flipped = false;
              }
            });
            flipContainer.classList.add('flip-open');
            flipContainer._flipped = true;
            // Add document click listener
            outsideFlipListener = function(e) {
              if (!flipContainer.contains(e.target)) {
                flipped = false;
                flipContainer.style.transform = '';
                flipContainer.classList.remove('flip-open');
                flipContainer._flipped = false;
                document.removeEventListener('mousedown', outsideFlipListener, true);
              }
            };
            document.addEventListener('mousedown', outsideFlipListener, true);
          } else {
            flipContainer.classList.remove('flip-open');
            flipContainer._flipped = false;
            if (outsideFlipListener) {
              document.removeEventListener('mousedown', outsideFlipListener, true);
              outsideFlipListener = null;
            }
          }
        });
        // --- HOVER TO OPEN SKIN SITE ---
        let hoverTimer = null;
        let lastMousePos = null;
        let stillTimer = null;
        let hoverDelay = 1000; // 1 second of stillness
        let openDelay = 10000; // 10 seconds total before open
        let hoverStartTime = null;
        let mouseStopped = false;
        function clearHoverTimers() {
          if (hoverTimer) clearTimeout(hoverTimer);
          if (stillTimer) clearTimeout(stillTimer);
          hoverTimer = null;
          stillTimer = null;
          hoverStartTime = null;
          mouseStopped = false;
        }
        circle.addEventListener('mouseenter', () => {
          lastMousePos = null;
          mouseStopped = false;
          hoverStartTime = Date.now();
          // Listen for mousemove to detect if mouse is stopped
          function onMove(e) {
            if (!lastMousePos || lastMousePos.x !== e.clientX || lastMousePos.y !== e.clientY) {
              lastMousePos = { x: e.clientX, y: e.clientY };
              mouseStopped = false;
              if (stillTimer) clearTimeout(stillTimer);
              stillTimer = setTimeout(() => {
                mouseStopped = true;
                // Only start the open timer if mouse is stopped
                if (hoverTimer) clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                  window.open(`https://skins.gota.io/skins/${skin.uuid}`, '_blank');
                  clearHoverTimers();
                  circle.removeEventListener('mousemove', onMove);
                }, openDelay - hoverDelay);
              }, hoverDelay);
            }
          }
          circle.addEventListener('mousemove', onMove);
          // Start the still timer immediately in case mouse is already stopped
          stillTimer = setTimeout(() => {
            mouseStopped = true;
            hoverTimer = setTimeout(() => {
              window.open(`https://skins.gota.io/skins/${skin.uuid}`, '_blank');
              clearHoverTimers();
              circle.removeEventListener('mousemove', onMove);
            }, openDelay - hoverDelay);
          }, hoverDelay);
          // Remove listeners/timers on mouseleave
          circle.addEventListener('mouseleave', function leaveHandler() {
            clearHoverTimers();
            circle.removeEventListener('mousemove', onMove);
            circle.removeEventListener('mouseleave', leaveHandler);
          });
        });
        circle.innerHTML = '';
        circle.appendChild(flipContainer);
      }
      // After rendering, ensure animation state is correct
      setCircleSlotAnimation(box.style.display !== 'none');
      // Add mouseup to document to handle drop outside slot
      if (!window._skinGalleryDragMouseup) {
        window._skinGalleryDragMouseup = true;
        document.addEventListener('mouseup', function(e) {
          dragMouseDown = false;
          clearTimeout(dragTimer);
          if (isDragActive) {
            finishDrag(e);
          } else {
            cleanupDragState();
          }
        });
      }
      function finishDrag(e) {
        isDragActive = false;
        if (draggingSlot) draggingSlot.classList.remove('dragging');
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', mouseMoveHandler);
        if (lastTargetSlot) lastTargetSlot.classList.remove('drag-over');
        // Animate clone back if not dropped or dropped on same slot
        let shouldReorder = dragFromIndex !== null && dragOverIndex !== null && dragFromIndex !== dragOverIndex;
        if (dragClone) {
          if (!shouldReorder) {
            // Animate back to original position
            dragClone.style.transition = 'all 0.22s cubic-bezier(.4,1.6,.5,1)';
            dragClone.style.left = dragOrigin.x + 'px';
            dragClone.style.top = dragOrigin.y + 'px';
            setTimeout(() => {
              if (dragClone && dragClone.parentNode) dragClone.remove();
            }, 220);
          } else {
            if (dragClone.parentNode) dragClone.remove();
          }
        }
        if (draggingSlot) draggingSlot.style.visibility = '';
        if (shouldReorder) {
          if (!search && !searchAllProfiles) {
            const skins = profiles[currentProfileIdx].skins;
            const [moved] = skins.splice(dragFromIndex, 1);
            skins.splice(dragOverIndex, 0, moved);
            saveProfiles();
            renderSkins();
          }
        }
        cleanupDragState();
      }
    }

    // Notification element for success and delete feedback
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '30px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'rgba(40,180,80,0.97)';
    notification.style.color = 'white';
    notification.style.padding = '10px 24px';
    notification.style.borderRadius = '8px';
    notification.style.fontSize = '16px';
    notification.style.fontWeight = 'bold';
    notification.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    notification.style.zIndex = '10010';
    notification.style.display = 'none';
    document.body.appendChild(notification);

    function showNotification(msg, color = 'green') {
      notification.textContent = msg;
      notification.style.display = 'block';
      notification.style.background = color === 'red' ? 'rgba(200,40,40,0.97)' : 'rgba(40,180,80,0.97)';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 1200);
    }

    addButton.addEventListener('click', () => {
      const value = skinInput.value.trim();
      if (!value) return;
      // Parse input: expect 'name | uuid' or 'name|uuid'
      let [name, uuid] = value.split('|').map(s => s.trim());
      if (!name || !uuid) {
        showModal({
          title: 'Invalid Format',
          message: 'Please enter in the format: Skin Name | UUID',
          confirmText: 'OK',
          cancelText: null,
          onConfirm: () => {}
        });
        return;
      }
      // Prevent duplicate skin names in the same profile
      const exists = (profiles[currentProfileIdx].skins || []).some(skin => skin.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        showModal({
          title: 'Duplicate Skin Name',
          message: 'A skin with this name already exists in this profile!',
          confirmText: 'OK',
          cancelText: null,
          onConfirm: () => {}
        });
        return;
      }
      // Extract UUID if a full URL is provided
      const uuidMatch = uuid.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
      if (uuidMatch) uuid = uuidMatch[0].trim();
      else uuid = uuid.trim();
      profiles[currentProfileIdx].skins.push({ name, uuid });
      saveProfiles();
      skinInput.value = '';
      renderSkins();
      showNotification('Skin added successfully!');
    });

    const POSITION_KEY = 'gotaio_gallery_position';
    // Load position from localStorage
    function loadPosition() {
      const pos = localStorage.getItem(POSITION_KEY);
      if (pos) {
        try {
          const { left, top, width, height } = JSON.parse(pos);
          if (left !== undefined) box.style.left = left + 'px';
          if (top !== undefined) box.style.top = top + 'px';
          if (width !== undefined) box.style.width = width + 'px';
          if (height !== undefined) box.style.height = height + 'px';
        } catch (e) {}
      } else {
        box.style.left = '181px';
        box.style.top = '11px';
        box.style.width = '600px';
        box.style.height = '355px';
      }
    }
    // Save position to localStorage
    function savePosition(left, top) {
      localStorage.setItem(POSITION_KEY, JSON.stringify({ left, top, width: box.offsetWidth, height: box.offsetHeight }));
    }

    // Call loadProfiles and loadProfileIdx before updating UI
    (async function() {
      await loadProfiles();
      if (typeof loadProfileIdx === 'function') await loadProfileIdx();
      updateProfileSelect();
      renderSkins();
    })();

    // Remove old drag handle logic and add border-drag logic
    // Add a border overlay for drag feedback
    const borderOverlay = document.createElement('div');
    borderOverlay.style.position = 'absolute';
    borderOverlay.style.top = '0';
    borderOverlay.style.left = '0';
    borderOverlay.style.width = '100%';
    borderOverlay.style.height = '100%';
    borderOverlay.style.zIndex = '10005';
    borderOverlay.style.pointerEvents = 'none';
    borderOverlay.style.border = '2px solid transparent';
    borderOverlay.style.borderRadius = '12px';
    box.appendChild(borderOverlay);

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    // Make all borders draggable
    box.addEventListener('mousedown', (e) => {
      // Only start drag if on border (within 10px of edge)
      const rect = box.getBoundingClientRect();
      const borderThreshold = 10;
      const onBorder = (
        e.clientX - rect.left < borderThreshold ||
        rect.right - e.clientX < borderThreshold ||
        e.clientY - rect.top < borderThreshold ||
        rect.bottom - e.clientY < borderThreshold
      );
      if (onBorder) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = box.offsetLeft;
        startTop = box.offsetTop;
        borderOverlay.style.border = '2px solid #4caf50';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      }
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      box.style.left = `${startLeft + dx}px`;
      box.style.top = `${startTop + dy}px`;
    });
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        borderOverlay.style.border = '2px solid transparent';
        document.body.style.userSelect = '';
        // Save position
        savePosition(box.offsetLeft, box.offsetTop);
      }
    });

    // Add logic to change cursor to 'move' when near border
    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      const borderThreshold = 10;
      const onBorder = (
        e.clientX - rect.left < borderThreshold ||
        rect.right - e.clientX < borderThreshold ||
        e.clientY - rect.top < borderThreshold ||
        rect.bottom - e.clientY < borderThreshold
      );
      if (onBorder) {
        box.style.cursor = 'move';
      } else {
        box.style.cursor = '';
      }
    });
    box.addEventListener('mouseleave', () => {
      box.style.cursor = '';
    });

    // Call loadPosition as the very last step
    loadPosition();

    // Function to show/hide the gallery UI based on #main visibility
    function updateGalleryVisibility() {
      const mainMenu = document.getElementById('main');
      if (mainMenu && mainMenu.style.display !== 'none') {
        box.style.display = '';
      } else {
        box.style.display = 'none';
      }
    }

    // Instantly update gallery UI visibility using requestAnimationFrame
    (function instantGalleryVisibility() {
      const mainMenu = document.getElementById('main');
      if (mainMenu) {
        const style = window.getComputedStyle(mainMenu);
        // Hide instantly as soon as opacity is not 1 (even if still visible)
        const visible = style.display !== 'none' && style.opacity === '1';
        box.style.display = visible ? '' : 'none';
      } else {
        box.style.display = 'none';
      }
      requestAnimationFrame(instantGalleryVisibility);
    })();

    let galleryOpen = false;

    function setGalleryVisibility() {
      const mainMenu = document.getElementById('main');
      const style = mainMenu ? window.getComputedStyle(mainMenu) : null;
      const menuVisible = mainMenu && style.display !== 'none' && style.opacity === '1';
      box.style.display = (galleryOpen && menuVisible) ? '' : 'none';
      setCircleSlotAnimation(galleryOpen && menuVisible);
    }

    // Update the gallery button to toggle the gallery UI
    function insertGalleryButton() {
      // Insert next to Profile (when logged in)
      const profileBtn = document.getElementById('account-profile');
      if (profileBtn && !document.getElementById('account-gallery')) {
        const galleryBtn = document.createElement('button');
        galleryBtn.id = 'account-gallery';
        galleryBtn.className = profileBtn.className;
        galleryBtn.textContent = 'Gallery';
        galleryBtn.style.cssText = profileBtn.style.cssText;
        galleryBtn.addEventListener('click', function() {
          galleryOpen = !galleryOpen;
          setGalleryVisibility();
        });
        profileBtn.parentNode.insertBefore(galleryBtn, profileBtn);
      }
      // Insert next to Login (when not logged in)
      const loginBtn = document.getElementById('account-login');
      if (loginBtn && !document.getElementById('account-gallery-login')) {
        const galleryBtn = document.createElement('button');
        galleryBtn.id = 'account-gallery-login';
        galleryBtn.className = loginBtn.className;
        galleryBtn.textContent = 'Gallery';
        galleryBtn.style.cssText = loginBtn.style.cssText;
        galleryBtn.addEventListener('click', function() {
          galleryOpen = !galleryOpen;
          setGalleryVisibility();
        });
        loginBtn.parentNode.insertBefore(galleryBtn, loginBtn.nextSibling);
      }
    }

    (function ensureGalleryButton() {
      insertGalleryButton();
      requestAnimationFrame(ensureGalleryButton);
    })();

    (function instantGalleryVisibility() {
      setGalleryVisibility();
      requestAnimationFrame(instantGalleryVisibility);
    })();

    // Add resize handle to #skinBox
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    box.appendChild(resizeHandle);

    let resizing = false;
    let resizeStartX, resizeStartY, resizeStartW, resizeStartH;
    resizeHandle.addEventListener('mousedown', (e) => {
      resizing = true;
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartW = box.offsetWidth;
      resizeStartH = box.offsetHeight;
      document.body.style.userSelect = 'none';
      e.stopPropagation();
    });
    document.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      let newW = Math.max(320, Math.min(window.innerWidth - box.offsetLeft - 10, resizeStartW + (e.clientX - resizeStartX)));
      let newH = Math.max(200, Math.min(window.innerHeight - box.offsetTop - 10, resizeStartH + (e.clientY - resizeStartY)));
      box.style.width = newW + 'px';
      box.style.height = newH + 'px';
      // Save position and size live while resizing
      savePosition(box.offsetLeft, box.offsetTop);
    });
    document.addEventListener('mouseup', () => {
      if (resizing) {
        resizing = false;
        document.body.style.userSelect = '';
        // Save position and size one last time
        savePosition(box.offsetLeft, box.offsetTop);
      }
    });

    // Optionally, check for overlap with #hud or other important elements and warn
    function checkOverlap() {
      const hud = document.getElementById('hud');
      if (!hud) return;
      const boxRect = box.getBoundingClientRect();
      const hudRect = hud.getBoundingClientRect();
      const overlap = !(boxRect.right < hudRect.left || boxRect.left > hudRect.right || boxRect.bottom < hudRect.top || boxRect.top > hudRect.bottom);
      if (overlap) {
        box.classList.add('overlap-warning');
      } else {
        box.classList.remove('overlap-warning');
      }
    }
    setInterval(checkOverlap, 1000);

    // --- Custom Modal for Confirm and Input ---
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100vw';
    modalOverlay.style.height = '100vh';
    modalOverlay.style.background = 'rgba(0,0,0,0.35)';
    modalOverlay.style.display = 'none';
    modalOverlay.style.zIndex = '10050';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.transition = 'opacity 0.2s';

    const modalBox = document.createElement('div');
    modalBox.style.background = '#23272e';
    modalBox.style.color = 'white';
    modalBox.style.padding = '28px 32px 22px 32px';
    modalBox.style.borderRadius = '10px';
    modalBox.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
    modalBox.style.minWidth = '280px';
    modalBox.style.maxWidth = '90vw';
    modalBox.style.display = 'flex';
    modalBox.style.flexDirection = 'column';
    modalBox.style.alignItems = 'center';
    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);

    function showModal({ title, message, input, confirmText, cancelText, onConfirm }) {
      modalBox.innerHTML = '';
      const titleEl = document.createElement('div');
      titleEl.textContent = title || '';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.fontSize = '18px';
      titleEl.style.marginBottom = '10px';
      modalBox.appendChild(titleEl);
      if (message) {
        const msgEl = document.createElement('div');
        msgEl.innerHTML = message;
        msgEl.style.marginBottom = '16px';
        msgEl.style.textAlign = 'center';
        modalBox.appendChild(msgEl);
      }
      let inputEl = null;
      if (input) {
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.style.width = '100%';
        inputEl.style.padding = '7px';
        inputEl.style.marginBottom = '16px';
        inputEl.style.borderRadius = '5px';
        inputEl.style.border = '1px solid #888';
        inputEl.style.fontSize = '15px';
        inputEl.placeholder = input.placeholder || '';
        if (input.value) inputEl.value = input.value;
        modalBox.appendChild(inputEl);
        setTimeout(() => inputEl.focus(), 50);
      }
      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.gap = '12px';
      btnRow.style.justifyContent = cancelText ? 'center' : 'center'; // Always center
      modalBox.appendChild(btnRow);
      const okBtn = document.createElement('button');
      okBtn.textContent = confirmText || 'OK';
      // If this is a delete confirmation, make OK red and Cancel green
      if (confirmText && confirmText.toLowerCase().includes('delete')) {
        okBtn.style.background = '#d32f2f'; // red for delete
        okBtn.style.color = 'white';
        okBtn.style.border = 'none';
        okBtn.style.borderRadius = '5px';
        okBtn.style.padding = '7px 18px';
        okBtn.style.fontSize = '15px';
        okBtn.style.cursor = 'pointer';
      } else {
        okBtn.style.background = '#4caf50'; // green for normal OK
        okBtn.style.color = 'white';
        okBtn.style.border = 'none';
        okBtn.style.borderRadius = '5px';
        okBtn.style.padding = '7px 18px';
        okBtn.style.fontSize = '15px';
        okBtn.style.cursor = 'pointer';
      }
      btnRow.appendChild(okBtn);
      if (cancelText) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = cancelText || 'Cancel';
        if (confirmText && confirmText.toLowerCase().includes('delete')) {
          cancelBtn.style.background = '#4caf50'; // green for cancel
          cancelBtn.style.color = 'white';
        } else {
          cancelBtn.style.background = '#d32f2f'; // red for cancel in normal modals
          cancelBtn.style.color = 'white';
        }
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '5px';
        cancelBtn.style.padding = '7px 18px';
        cancelBtn.style.fontSize = '15px';
        cancelBtn.style.cursor = 'pointer';
        btnRow.appendChild(cancelBtn);
        cancelBtn.onclick = () => {
          modalOverlay.style.display = 'none';
        };
      }
      modalOverlay.style.display = 'flex';
      okBtn.onclick = () => {
        if (inputEl) {
          onConfirm(inputEl.value);
        } else {
          onConfirm();
        }
        modalOverlay.style.display = 'none';
      };
    }

    // Delete profile logic with confirmation using modal
    delOption.addEventListener('click', () => {
      if (profiles.length <= 1) {
        showModal({
          title: 'Cannot Delete Profile',
          message: 'You cannot delete the last profile.',
          confirmText: 'OK',
          cancelText: null,
          onConfirm: () => {}
        });
        return;
      }
      showModal({
        title: 'Delete Profile',
        message: `Are you sure you want to delete the profile "${profiles[currentProfileIdx].name}"?<br><span style='color:#f55'>(This cannot be undone.)</span>`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
          profiles.splice(currentProfileIdx, 1);
          if (currentProfileIdx >= profiles.length) currentProfileIdx = profiles.length - 1;
          saveProfiles();
          updateProfileSelect();
          renderSkins();
        }
      });
    });

    // Use modal for add profile
    addOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      showModal({
        title: 'Add Profile',
        message: 'Enter new profile name:',
        input: { placeholder: 'Profile name' },
        confirmText: 'Add',
        cancelText: 'Cancel',
        onConfirm: (name) => {
          if (!name) return;
          if (profiles.some(p => p.name === name)) {
            showModal({
              title: 'Duplicate Profile Name',
              message: 'You already have a profile with that name. (Both will be kept)',
              confirmText: 'OK',
              cancelText: null, // Remove cancel button
              onConfirm: () => {}
            });
            return;
          }
          profiles.push({ name, skins: [] });
          currentProfileIdx = profiles.length - 1;
          saveProfiles();
          updateProfileSelect();
          renderSkins();
        }
      });
    });

    // Improve dropdown option readability in modal
    const styleFix = document.createElement('style');
    styleFix.textContent = `
  #gotaio-profile-modal select, #gotaio-profile-modal option {
    background: #fff !important;
    color: #23272e !important;
  }
  `;
  document.head.appendChild(styleFix);

    // --- BEGIN: Skins Site Helper (from your script) ---
    if (location.hostname === 'skins.gota.io') {
        // Use Tampermonkey GM_* APIs for cross-domain profile storage
        async function getProfiles() {
            const data = await (typeof GM_getValue === 'function' ? GM_getValue('gotaio_profiles_v2') : null);
            let profiles = [];
            if (data) {
                try {
                    profiles = JSON.parse(data);
                    if (!Array.isArray(profiles)) throw new Error('Invalid format');
                } catch (e) {
                    profiles = [{ name: 'Default', skins: [] }];
                }
            } else {
                profiles = [{ name: 'Default', skins: [] }];
            }
            // Defensive: ensure all profiles have name and skins
            profiles = profiles.map(p => ({
                name: typeof p.name === 'string' ? p.name : 'Default',
                skins: Array.isArray(p.skins) ? p.skins : []
            }));
            return profiles;
        }
        async function saveProfiles(profiles) {
            if (typeof GM_setValue === 'function') {
                await GM_setValue('gotaio_profiles_v2', JSON.stringify(profiles));
            }
        }
        function showProfileSelectModal(profiles, onSelect) {
            // Remove any existing modal
            let old = document.getElementById('gotaio-profile-modal');
            if (old) old.remove();
            const overlay = document.createElement('div');
            overlay.id = 'gotaio-profile-modal';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0,0,0,0.35)';
            overlay.style.zIndex = '10050';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            const box = document.createElement('div');
            box.style.background = '#23272e';
            box.style.color = 'white';
            box.style.padding = '28px 32px 22px 32px';
            box.style.borderRadius = '10px';
            box.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
            box.style.minWidth = '280px';
            box.style.maxWidth = '90vw';
            box.style.display = 'flex';
            box.style.flexDirection = 'column';
            box.style.alignItems = 'center';
            const title = document.createElement('div');
            title.textContent = 'Add skin to profile';
            title.style.fontWeight = 'bold';
            title.style.fontSize = '18px';
            title.style.marginBottom = '10px';
            box.appendChild(title);
            const select = document.createElement('select');
            select.style.width = '100%';
            select.style.padding = '7px';
            select.style.marginBottom = '24px'; // more space below
            select.style.borderRadius = '5px';
            select.style.border = '2px solid #4caf50';
            select.style.fontSize = '16px';
            select.style.fontWeight = 'bold';
            select.style.background = '#fff';
            select.style.color = '#23272e';
            select.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
            select.style.outline = 'none';
            select.onfocus = function() { select.style.border = '2px solid #1976d2'; };
            select.onblur = function() { select.style.border = '2px solid #4caf50'; };
            // Always show all profiles
            profiles.forEach((profile, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = profile.name;
                select.appendChild(opt);
            });
            box.appendChild(select);
            const btnRow = document.createElement('div');
            btnRow.style.display = 'flex';
            btnRow.style.gap = '12px';
            btnRow.style.justifyContent = 'center';
            const okBtn = document.createElement('button');
            okBtn.textContent = 'Add';
            okBtn.style.background = '#4caf50';
            okBtn.style.color = 'white';
            okBtn.style.border = 'none';
            okBtn.style.borderRadius = '5px';
            okBtn.style.padding = '7px 18px';
            okBtn.style.fontSize = '15px';
            okBtn.style.cursor = 'pointer';
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.background = '#d32f2f';
            cancelBtn.style.color = 'white';
            cancelBtn.style.border = 'none';
            cancelBtn.style.borderRadius = '5px';
            cancelBtn.style.padding = '7px 18px';
            cancelBtn.style.fontSize = '15px';
            cancelBtn.style.cursor = 'pointer';
            btnRow.appendChild(okBtn);
            btnRow.appendChild(cancelBtn);
            box.appendChild(btnRow);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            okBtn.onclick = function() {
                onSelect(parseInt(select.value, 10));
                overlay.remove();
            };
            cancelBtn.onclick = function() {
                overlay.remove();
            };
        }
        // Notification helper
        function showSkinSiteNotification(msg, color = 'green') {
            let note = document.getElementById('gotaio-skin-site-note');
            if (!note) {
                note = document.createElement('div');
                note.id = 'gotaio-skin-site-note';
                note.style.position = 'fixed';
                note.style.top = '30px';
                note.style.left = '50%';
                note.style.transform = 'translateX(-50%)';
                note.style.background = color === 'red' ? 'rgba(200,40,40,0.97)' : 'rgba(40,180,80,0.97)';
                note.style.color = 'white';
                note.style.padding = '10px 24px';
                note.style.borderRadius = '8px';
                note.style.fontSize = '16px';
                note.style.fontWeight = 'bold';
                note.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                note.style.zIndex = '10010';
                note.style.display = 'none';
                document.body.appendChild(note);
            }
            note.textContent = msg;
            note.style.display = 'block';
            note.style.background = color === 'red' ? 'rgba(200,40,40,0.97)' : 'rgba(40,180,80,0.97)';
            setTimeout(() => {
                note.style.display = 'none';
            }, 1200);
        }
        function addUUIDButtons() {
            let skinList = [];
            if (location.pathname.startsWith('/skins')) {
                skinList = document.querySelectorAll('.grid .flex.flex-col');
            } else {
                skinList = document.querySelectorAll('#skins li');
            }
            skinList.forEach(skinElem => {
                if (skinElem.querySelector('.uuid-btn')) return;
                const img = skinElem.querySelector('img');
                if (!img || !img.src) return;
                const match = img.src.match(/([a-f0-9\-]{36})\.png$/i);
                if (!match) return;
                const uuid = match[1];
                let skinName = '';
                const nameElem = skinElem.querySelector('span.text-lg.font-bold');
                if (nameElem && nameElem.textContent.trim().length > 0) {
                    skinName = nameElem.textContent.trim();
                } else {
                    const possibleNameTags = ['h3', 'h4', 'h5', 'span', 'div', 'p'];
                    for (const tag of possibleNameTags) {
                        const elem = skinElem.querySelector(tag);
                        if (elem && elem.textContent.trim().length > 0) {
                            skinName = elem.textContent.trim();
                            break;
                        }
                    }
                }
                const btn = document.createElement('button');
                btn.textContent = 'Copy';
                btn.className = 'uuid-btn';
                btn.style.marginTop = '2px';
                btn.style.padding = '2px 8px';
                btn.style.borderRadius = '4px';
                btn.style.border = 'none';
                btn.style.background = '#D65050';
                btn.style.color = '#fff';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = 'bold';
                btn.style.display = 'block';
                btn.style.marginLeft = '0';
                btn.style.marginRight = '0';
                btn.style.marginBottom = '0';
                btn.onclick = function() {
                    const textToCopy = skinName ? `${skinName} | ${uuid}` : uuid;
                    navigator.clipboard.writeText(textToCopy);
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 1200);
                };
                const addBtn = document.createElement('button');
                addBtn.textContent = 'Add';
                addBtn.className = 'add-btn';
                addBtn.style.marginTop = '2px';
                addBtn.style.padding = '2px 8px';
                addBtn.style.borderRadius = '4px';
                addBtn.style.border = 'none';
                addBtn.style.background = '#4CAF50';
                addBtn.style.color = '#fff';
                addBtn.style.cursor = 'pointer';
                addBtn.style.fontWeight = 'bold';
                addBtn.style.display = 'block';
                addBtn.style.marginBottom = '0';
                addBtn.onclick = async function() {
                    // Always reload profiles before showing modal
                    const profiles = await getProfiles();
                    showProfileSelectModal(profiles, async function(profileIdx) {
                        // Prevent duplicate skin names in the selected profile
                        const exists = (profiles[profileIdx].skins || []).some(skin => skin.name.toLowerCase() === skinName.toLowerCase());
                        if (exists) {
                            showSkinSiteNotification('Skin name already exists in this profile!', 'red');
                            return;
                        }
                        profiles[profileIdx].skins.push({ name: skinName, uuid });
                        await saveProfiles(profiles);
                        showSkinSiteNotification('Skin added to profile!');
                    });
                };
                const flexWrapper = document.createElement('div');
                flexWrapper.style.display = 'flex';
                flexWrapper.style.flexDirection = 'row';
                flexWrapper.style.justifyContent = 'center';
                flexWrapper.style.alignItems = 'center';
                flexWrapper.style.gap = '8px';
                flexWrapper.appendChild(btn);
                flexWrapper.appendChild(addBtn);
                skinElem.appendChild(flexWrapper);
            });
        }
        const observer = new MutationObserver(addUUIDButtons);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('DOMContentLoaded', addUUIDButtons);
        setTimeout(addUUIDButtons, 1000);

        // --- Add Copy/Add buttons to single skin page ---
        function addUUIDButtonsSingleSkin() {
            // Only run on /skins/<uuid> (not /skins or /explore)
            if (!/^\/skins\/[a-f0-9\-]{36}$/i.test(location.pathname)) return;
            // Find the main skin image
            const img = document.querySelector('img.rounded-full.rainbow');
            if (!img || !img.src) return;
            // Extract UUID from image src
            const match = img.src.match(/([a-f0-9\-]{36})\.png$/i);
            if (!match) return;
            const uuid = match[1];
            // Find the skin name (from h3)
            let skinName = '';
            const nameElem = document.querySelector('h3.text-lg');
            if (nameElem && nameElem.textContent.trim().length > 0) {
                skinName = nameElem.textContent.trim();
            }
            // Prevent duplicate buttons
            if (img.parentElement.querySelector('.uuid-btn')) return;
            // Create Copy button
            const btn = document.createElement('button');
            btn.textContent = 'Copy';
            btn.className = 'uuid-btn';
            btn.style.marginTop = '12px';
            btn.style.padding = '2px 8px';
            btn.style.borderRadius = '4px';
            btn.style.border = 'none';
            btn.style.background = '#D65050';
            btn.style.color = '#fff';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.display = 'inline-block';
            btn.onclick = function() {
                const textToCopy = skinName ? `${skinName} | ${uuid}` : uuid;
                navigator.clipboard.writeText(textToCopy);
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 1200);
            };
            // Create Add button
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Add';
            addBtn.className = 'add-btn';
            addBtn.style.marginLeft = '8px';
            addBtn.style.marginTop = '12px';
            addBtn.style.padding = '2px 8px';
            addBtn.style.borderRadius = '4px';
            addBtn.style.border = 'none';
            addBtn.style.background = '#4CAF50';
            addBtn.style.color = '#fff';
            addBtn.style.cursor = 'pointer';
            addBtn.style.fontWeight = 'bold';
            addBtn.style.display = 'inline-block';
            addBtn.onclick = async function() {
                const profiles = await getProfiles();
                showProfileSelectModal(profiles, async function(profileIdx) {
                    const exists = (profiles[profileIdx].skins || []).some(skin => skin.name.toLowerCase() === skinName.toLowerCase());
                    if (exists) {
                        showSkinSiteNotification('Skin name already exists in this profile!', 'red');
                        return;
                    }
                    profiles[profileIdx].skins.push({ name: skinName, uuid });
                    await saveProfiles(profiles);
                    showSkinSiteNotification('Skin added to profile!');
                });
            };
            // Insert buttons after the image
            const btnRow = document.createElement('div');
            btnRow.style.display = 'flex';
            btnRow.style.flexDirection = 'row';
            btnRow.style.justifyContent = 'center';
            btnRow.style.alignItems = 'center';
            btnRow.style.gap = '8px';
            btnRow.appendChild(btn);
            btnRow.appendChild(addBtn);
            img.parentElement.appendChild(btnRow);
        }
        // Observe for navigation or DOM changes
        if (location.hostname === 'skins.gota.io') {
            addUUIDButtonsSingleSkin();
            const observer2 = new MutationObserver(addUUIDButtonsSingleSkin);
            observer2.observe(document.body, { childList: true, subtree: true });
            window.addEventListener('DOMContentLoaded', addUUIDButtonsSingleSkin);
            setTimeout(addUUIDButtonsSingleSkin, 1000);
        }
    }
    // --- END: Skins Site Helper ---

    // --- BEGIN: Real-time sync for Tampermonkey GM storage ---
    if (typeof GM_addValueChangeListener === 'function') {
        GM_addValueChangeListener('gotaio_profiles_v2', async function(name, oldValue, newValue, remote) {
            if (remote) {
                await loadProfiles();
                if (typeof loadProfileIdx === 'function') await loadProfileIdx();
                if (typeof updateProfileSelect === 'function') updateProfileSelect();
                if (typeof renderSkins === 'function') renderSkins();
                showNotification('Skins synced!', 'green');
            }
        });
    }
    // --- END: Real-time sync for Tampermonkey GM storage ---

    // Listen for storage changes to sync profiles/skins in real time
    window.addEventListener('storage', async function(e) {
      if (e.key === 'gotaio_profiles_v2') {
        // Reload profiles and update UI instantly
        if (typeof loadProfiles === 'function') {
          await loadProfiles();
          if (typeof loadProfileIdx === 'function') await loadProfileIdx();
          if (typeof updateProfileSelect === 'function') updateProfileSelect();
          if (typeof renderSkins === 'function') renderSkins();
        }
      }
    });

    // Add Move Up/Down buttons to the profile management menu
    function showReorderProfilesMenu() {
      // Remove any existing reorder menu
      let old = document.getElementById('gotaio-profile-reorder-menu');
      if (old) old.remove();
      const overlay = document.createElement('div');
      overlay.id = 'gotaio-profile-reorder-menu';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0,0,0,0.35)';
      overlay.style.zIndex = '10050';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      const box = document.createElement('div');
      box.style.background = '#23272e';
      box.style.color = 'white';
      box.style.padding = '28px 32px 22px 32px';
      box.style.borderRadius = '10px';
      box.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
      box.style.minWidth = '280px';
      box.style.maxWidth = '90vw';
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.alignItems = 'center';
      const title = document.createElement('div');
      title.textContent = 'Manage Profiles'; // Renamed
      title.style.fontWeight = 'bold';
      title.style.fontSize = '18px';
      title.style.marginBottom = '10px';
      box.appendChild(title);
      const list = document.createElement('ul');
      list.style.listStyle = 'none';
      list.style.padding = '0';
      list.style.margin = '0 0 18px 0';
      list.style.width = '100%';
      profiles.forEach((profile, idx) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.padding = '6px 0';
        li.style.borderBottom = '1px solid #333';
        const name = document.createElement('span');
        name.textContent = profile.name;
        name.style.flex = '1';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';
        name.style.whiteSpace = 'nowrap';
        if (idx === currentProfileIdx) {
          name.style.fontWeight = 'bold';
          name.style.color = '#4caf50';
        }
        li.appendChild(name);
        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '6px';
        // Up button
        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.title = 'Move Up';
        upBtn.style.background = '#444';
        upBtn.style.color = 'white';
        upBtn.style.border = 'none';
        upBtn.style.borderRadius = '4px';
        upBtn.style.padding = '2px 10px';
        upBtn.style.cursor = idx === 0 ? 'not-allowed' : 'pointer';
        upBtn.disabled = idx === 0;
        upBtn.onclick = () => {
          if (idx === 0) return;
          const temp = profiles[idx-1];
          profiles[idx-1] = profiles[idx];
          profiles[idx] = temp;
          if (currentProfileIdx === idx) currentProfileIdx--;
          else if (currentProfileIdx === idx-1) currentProfileIdx++;
          saveProfiles();
          saveProfileIdx();
          showReorderProfilesMenu();
          updateProfileSelect();
          renderSkins();
        };
        btns.appendChild(upBtn);
        // Down button
        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.title = 'Move Down';
        downBtn.style.background = '#444';
        downBtn.style.color = 'white';
        downBtn.style.border = 'none';
        downBtn.style.borderRadius = '4px';
        downBtn.style.padding = '2px 10px';
        downBtn.style.cursor = idx === profiles.length-1 ? 'not-allowed' : 'pointer';
        downBtn.disabled = idx === profiles.length-1;
        downBtn.onclick = () => {
          if (idx === profiles.length-1) return;
          const temp = profiles[idx+1];
          profiles[idx+1] = profiles[idx];
          profiles[idx] = temp;
          if (currentProfileIdx === idx) currentProfileIdx++;
          else if (currentProfileIdx === idx+1) currentProfileIdx--;
          saveProfiles();
          saveProfileIdx();
          showReorderProfilesMenu();
          updateProfileSelect();
          renderSkins();
        };
        btns.appendChild(downBtn);
        // Delete button (only if more than 1 profile)
        if (profiles.length > 1) {
          const delBtn = document.createElement('button');
          delBtn.textContent = '🗑️';
          delBtn.title = 'Delete Profile';
          delBtn.style.background = '#d32f2f';
          delBtn.style.color = 'white';
          delBtn.style.border = 'none';
          delBtn.style.borderRadius = '4px';
          delBtn.style.padding = '2px 10px';
          delBtn.style.cursor = 'pointer';
          delBtn.onclick = () => {
            // Hide manage profiles overlay while confirmation is open
            overlay.style.display = 'none';
            // Show confirmation modal with higher z-index
            const prevModalZ = modalOverlay.style.zIndex;
            modalOverlay.style.zIndex = '10060'; // higher than manage profiles
            showModal({
              title: 'Delete Profile',
              message: `Are you sure you want to delete the profile "${profile.name}"?<br><span style='color:#f55'>(This cannot be undone.)</span>`,
              confirmText: 'Delete',
              cancelText: 'Cancel',
              onConfirm: () => {
                profiles.splice(idx, 1);
                if (currentProfileIdx >= profiles.length) currentProfileIdx = profiles.length - 1;
                saveProfiles();
                saveProfileIdx();
                overlay.remove(); // close manage modal
                updateProfileSelect();
                renderSkins();
                // Restore modal z-index
                modalOverlay.style.zIndex = prevModalZ;
              }
            });
            // Restore manage profiles overlay if cancel is clicked
            // (Monkey-patch modalOverlay's cancel button)
            setTimeout(() => {
              const btns = modalBox.querySelectorAll('button');
              if (btns.length > 1) {
                btns[1].onclick = () => {
                  modalOverlay.style.display = 'none';
                  modalOverlay.style.zIndex = prevModalZ;
                  overlay.style.display = 'flex';
                };
              }
            }, 10);
          };
          btns.appendChild(delBtn);
        }
        li.appendChild(btns);
        list.appendChild(li);
      });
      box.appendChild(list);
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Done';
      closeBtn.style.background = '#4caf50';
      closeBtn.style.color = 'white';
      closeBtn.style.border = 'none';
      closeBtn.style.borderRadius = '5px';
      closeBtn.style.padding = '7px 18px';
      closeBtn.style.fontSize = '15px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => overlay.remove();
      box.appendChild(closeBtn);
      const footerNote = document.createElement('div');
      footerNote.textContent = 'Profiles can be reordered or deleted here.';
      footerNote.style.fontSize = '12px';
      footerNote.style.color = '#bbb';
      footerNote.style.marginTop = '12px';
      box.appendChild(footerNote);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }
    // Add a new option to the profile menu
    const reorderOption = document.createElement('div');
    reorderOption.textContent = 'Manage Profiles'; // Renamed
    reorderOption.style.padding = '8px 18px';
    reorderOption.style.cursor = 'pointer';
    reorderOption.addEventListener('mouseenter', () => reorderOption.style.background = 'rgba(33,150,243,0.18)');
    reorderOption.addEventListener('mouseleave', () => reorderOption.style.background = '');
    reorderOption.addEventListener('click', () => {
      profileMenu.style.display = 'none';
      showReorderProfilesMenu();
    });
    profileMenu.appendChild(reorderOption);

    // --- ENHANCED PROFILE MENU VISUALS (VISUAL ONLY) ---
    (function enhanceProfileMenuVisual() {
      // Add style for menu
      const menuStyle = document.createElement('style');
      menuStyle.textContent = `
        .gotaio-profile-menu { min-width: 140px; font-size: 13px; font-weight: 500; background: rgba(40,40,40,0.98); color: #fff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); padding: 2px 0; z-index: 10020; display: none; }
        .gotaio-profile-menu-option { display: flex; align-items: center; gap: 8px; padding: 5px 12px 5px 10px; cursor: pointer; transition: background 0.13s; font-size: 13px; font-weight: 500; user-select: none; border: none; background: none; border-radius: 4px; }
        .gotaio-profile-menu-option:hover { background: rgba(76,175,80,0.13); color: #4caf50; }
        .gotaio-profile-menu-divider { height: 1px; background: rgba(255,255,255,0.10); margin: 2px 0; border: none; }
        .gotaio-profile-menu-icon { width: 18px; text-align: center; font-size: 15px; flex-shrink: 0; opacity: 0.93; }
        .gotaio-profile-menu-group { margin-bottom: 1px; }
        .gotaio-profile-menu-bottom { margin-top: 1px; }
      `;
      document.head.appendChild(menuStyle);

      // Remove old menu options if present
      while (profileMenu.firstChild) profileMenu.removeChild(profileMenu.firstChild);
      profileMenu.className = 'gotaio-profile-menu';

      // Helper to create menu option (visual only)
      function makeOption(icon, text, onClick, extraClass) {
        const opt = document.createElement('div');
        opt.className = 'gotaio-profile-menu-option' + (extraClass ? ' ' + extraClass : '');
        const iconSpan = document.createElement('span');
        iconSpan.className = 'gotaio-profile-menu-icon';
        iconSpan.textContent = icon;
        opt.appendChild(iconSpan);
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        opt.appendChild(textSpan);
        if (onClick) opt.addEventListener('click', onClick);
        return opt;
      }
      // Group 1: Add/Rename
      const group1 = document.createElement('div');
      group1.className = 'gotaio-profile-menu-group';
      group1.appendChild(makeOption('➕', 'Add Profile', () => addOption.click()));
      group1.appendChild(makeOption('✏️', 'Rename Profile', () => renameOption.click()));
      profileMenu.appendChild(group1);
      // Divider
      profileMenu.appendChild(document.createElement('hr')).className = 'gotaio-profile-menu-divider';
      // Group 2: Delete/Share/Import
      const group2 = document.createElement('div');
      group2.className = 'gotaio-profile-menu-group';
      group2.appendChild(makeOption('🗑️', 'Delete Profile', () => delOption.click()));
      group2.appendChild(makeOption('📤', 'Share Profile', () => exportOption.click()));
      group2.appendChild(makeOption('📥', 'Import Profiles', () => importOption.click()));
      profileMenu.appendChild(group2);
      // Divider
      profileMenu.appendChild(document.createElement('hr')).className = 'gotaio-profile-menu-divider';
      // Bottom: Manage
      const bottom = document.createElement('div');
      bottom.className = 'gotaio-profile-menu-bottom';
      bottom.appendChild(makeOption('⚙️', 'Manage Profiles', () => reorderOption.click()));
      profileMenu.appendChild(bottom);
    })();

    // --- Add circle border to all skin images on skins.gota.io ---
        function addCircleBorderToSkins() {
            if (location.hostname !== 'skins.gota.io') return;
            // Select all skin images in explore, skins list, and single skin pages
            const imgs = Array.from(document.querySelectorAll('img'));
            imgs.forEach(img => {
                // Only target images that are likely skin images (by size or class)
                if (
                    img.classList.contains('rounded-full') ||
                    img.classList.contains('rainbow') ||
                    (img.width >= 64 && img.height >= 64 && /skin-data\.gota\.io\/.+\.png/.test(img.src))
                ) {
                    img.style.borderRadius = '50%';
                    img.style.border = '4px solid #FFD600'; // gold circle
                    img.style.boxSizing = 'border-box';
                }
            });
        }
        if (location.hostname === 'skins.gota.io') {
            addCircleBorderToSkins();
            const observer3 = new MutationObserver(addCircleBorderToSkins);
            observer3.observe(document.body, { childList: true, subtree: true });
            window.addEventListener('DOMContentLoaded', addCircleBorderToSkins);
            setTimeout(addCircleBorderToSkins, 1000);
        }

    // --- Add gold circle border only to skins you have in any profile ---
        async function addCircleBorderToOwnedSkins() {
            if (location.hostname !== 'skins.gota.io') return;
            // Get all owned UUIDs from all profiles (from GM or localStorage)
            let ownedUUIDs = new Set();
            let profiles = [];
            if (typeof GM_getValue === 'function') {
                const data = await GM_getValue('gotaio_profiles_v2');
                if (data) {
                    try { profiles = JSON.parse(data); } catch (e) { profiles = []; }
                }
            } else {
                try {
                    const data = localStorage.getItem('gotaio_profiles_v2');
                    if (data) profiles = JSON.parse(data);
                } catch (e) { profiles = []; }
            }
            profiles.forEach(p => (p.skins||[]).forEach(skin => ownedUUIDs.add(skin.uuid)));
            // Select all skin images
            const imgs = Array.from(document.querySelectorAll('img'));
            imgs.forEach(img => {
                // Remove any previous border/wrapper
                img.style.border = '';
                img.style.boxShadow = '';
                img.style.borderRadius = '';
                // Only target images that are likely skin images
                const match = img.src && img.src.match(/([a-f0-9\-]{36})\.png$/i);
                if (match) {
                    const uuid = match[1];
                    if (ownedUUIDs.has(uuid)) {
                        img.style.borderRadius = '50%';
                        img.style.border = '4px solid #a259e6'; // solid purple border
                        img.style.boxShadow = '0 0 0 3px #fff, 0 0 0 7px #e53935, 0 2px 14px #a259e688'; // white, red, purple glow
                        img.style.boxSizing = 'border-box';
                    }
                }
            });
        }
        if (location.hostname === 'skins.gota.io') {
            addCircleBorderToOwnedSkins();
            const observer4 = new MutationObserver(addCircleBorderToOwnedSkins);
            observer4.observe(document.body, { childList: true, subtree: true });
            window.addEventListener('DOMContentLoaded', addCircleBorderToOwnedSkins);
            setTimeout(addCircleBorderToOwnedSkins, 1000);
        }
  })();

