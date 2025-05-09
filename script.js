// GitHub integration settings
        let githubSettings = {
            username: 'adamismyusername',
            repo: 'sfdash',
            token: '',
            branch: 'main'
        };

        // Tool data structure
        let toolsData = [];

        // Track changes that need to be saved
        let unsavedChanges = false;

        // Track drag and drop state
        let draggedItem = null;
        let draggedItemIndex = null;
        let dragOverItemIndex = null;
        let originalOrder = [];
        let orderChanged = false;

        // Define tool colors
        const toolColors = [
            'var(--turquoise)', 'var(--emerald)', 'var(--peter-river)', 'var(--amethyst)', 'var(--wet-asphalt)', 
            'var(--green-sea)', 'var(--nephritis)', 'var(--belize-hole)', 'var(--wisteria)', 'var(--midnight-blue)', 
            'var(--sunflower)', 'var(--carrot)', 'var(--alizarin)', 'var(--clouds)', 'var(--concrete)', 
            'var(--orange)', 'var(--pumpkin)', 'var(--pomegranate)', 'var(--silver)', 'var(--asbestos)'
        ];

        // Initialize tools data with defaults
        function initializeDefaultTools() {
            toolsData = [];
            
            for (let i = 0; i < 8; i++) {
                const colorIndex = i % toolColors.length;
                
                toolsData.push({
                    id: i + 1,
                    icon: 'google-sheets', // Default icon file name
                    title: `Tool ${i+1}`,
                    description: `This is a description for Tool ${i+1}. It explains what this tool does and how to use it.`,
                    url: '#',
                    color: toolColors[colorIndex],
                    order: i,
                    quickLinks: [
                        { title: '', url: '' },
                        { title: '', url: '' },
                        { title: '', url: '' },
                        { title: '', url: '' },
                        { title: '', url: '' },
                        { title: '', url: '' }
                    ]
                });
            }
        }

        // Sort tools by order property
        function sortToolsByOrder() {
            toolsData.sort((a, b) => {
                return (a.order !== undefined ? a.order : 999) - (b.order !== undefined ? b.order : 999);
            });
        }

        // Create all tool cards
        function renderDashboard() {
            const dashboard = document.getElementById('dashboard');
            dashboard.innerHTML = ''; // Clear existing cards
            
            // Sort tools by order
            sortToolsByOrder();
            
            // Create a column tracker for tools positioning
            let columnHeights = [0, 0, 0, 0]; // For 4 columns
            let columnCount = 4;
            
            // Adjust column count based on screen width
            if (window.innerWidth <= 1400) columnCount = 3;
            if (window.innerWidth <= 1000) columnCount = 2;
            if (window.innerWidth <= 700) columnCount = 1;
            
            columnHeights = Array(columnCount).fill(0);
            
            toolsData.forEach((tool, index) => {
                const card = document.createElement('div');
                card.className = 'tool-card';
                card.setAttribute('data-tool-id', tool.id);
                card.setAttribute('data-index', index);
                card.setAttribute('draggable', 'true');
                
                const colorBand = document.createElement('div');
                colorBand.className = 'card-color-band';
                colorBand.style.backgroundColor = tool.color;
                
                // Create drag handle
                const dragHandle = document.createElement('div');
                dragHandle.className = 'drag-handle';
                
                // Create order indicator
                const orderIndicator = document.createElement('div');
                orderIndicator.className = 'order-indicator';
                orderIndicator.textContent = (tool.order !== undefined ? tool.order + 1 : index + 1);
                
                const header = document.createElement('div');
                header.className = 'tool-header';
                header.setAttribute('data-url', tool.url);
                
                // Add the colored background with opacity
                const headerBg = document.createElement('div');
                headerBg.className = 'tool-header-bg';
                headerBg.style.backgroundColor = tool.color;
                header.appendChild(headerBg);
                
                const iconDiv = document.createElement('div');
                iconDiv.className = 'tool-icon';
                
                // Create img element for SVG icon
                const iconImg = document.createElement('img');
                iconImg.src = `icons_logos/${tool.icon}.svg`;
                iconImg.alt = tool.title;
                iconDiv.appendChild(iconImg);
                
                const info = document.createElement('div');
                info.className = 'tool-info';
                
                const title = document.createElement('h3');
                title.className = 'tool-title';
                title.textContent = tool.title;
                
                const description = document.createElement('p');
                description.className = 'tool-description';
                description.textContent = tool.description;
                
                // Quick links section
                const quickLinksDiv = document.createElement('div');
                quickLinksDiv.className = 'tool-quick-links';
                
                // Only add quick links that have both title and URL
                if (tool.quickLinks && Array.isArray(tool.quickLinks)) {
                    tool.quickLinks.forEach((link, index) => {
                        if (link && link.title && link.url) {
                            const quickLink = document.createElement('a');
                            quickLink.className = 'quick-link';
                            quickLink.setAttribute('data-url', link.url);
                            
                            // Use SVG for link icon
                            const linkIconImg = document.createElement('img');
                            linkIconImg.src = 'icons_logos/link.svg';
                            linkIconImg.alt = 'Link';
                            linkIconImg.className = 'quick-link-icon';
                            
                            const linkText = document.createTextNode(link.title);
                            
                            quickLink.appendChild(linkIconImg);
                            quickLink.appendChild(linkText);
                            
                            // Add click event to the quick link
                            quickLink.addEventListener('click', function(e) {
                                e.stopPropagation();
                                if (!document.body.classList.contains('admin-mode')) {
                                    const url = this.getAttribute('data-url');
                                    if (url && url !== '#') {
                                        window.open(url, '_blank');
                                    }
                                }
                            });
                            
                            quickLinksDiv.appendChild(quickLink);
                        }
                    });
                }
                
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = `Click to open ${tool.title}`;
                
                // Edit button (hidden by default)
                const editButton = document.createElement('div');
                editButton.className = 'edit-button';
                
                // Use SVG for edit icon
                const editIconImg = document.createElement('img');
                editIconImg.src = 'icons_logos/edit.svg';
                editIconImg.alt = 'Edit';
                editButton.appendChild(editIconImg);
                
                editButton.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent the card click event
                    openEditPanel(tool.id);
                });
                
                info.appendChild(title);
                info.appendChild(description);
                header.appendChild(iconDiv);
                header.appendChild(info);
                
                // Only append color band in the old design - we're now skipping this
                // card.appendChild(colorBand);
                
                card.appendChild(dragHandle);
                card.appendChild(orderIndicator);
                card.appendChild(header);
                
                // Only append quick links div if it has children
                if (quickLinksDiv.children.length > 0) {
                    card.appendChild(quickLinksDiv);
                }
                
                card.appendChild(tooltip);
                card.appendChild(editButton);
                
                dashboard.appendChild(card);
                
                // Add click event to the header to open the main tool URL
                header.addEventListener('click', function() {
                    if (!document.body.classList.contains('admin-mode')) {
                        const url = this.getAttribute('data-url');
                        if (url && url !== '#') {
                            window.open(url, '_blank');
                        }
                    }
                });
                
                // Drag and drop events
                card.addEventListener('dragstart', handleDragStart);
                card.addEventListener('dragend', handleDragEnd);
                card.addEventListener('dragover', handleDragOver);
                card.addEventListener('dragenter', handleDragEnter);
                card.addEventListener('dragleave', handleDragLeave);
                card.addEventListener('drop', handleDrop);
            });

            // Update admin mode if active
            if (document.body.classList.contains('admin-mode')) {
                document.querySelectorAll('.tool-card').forEach(card => {
                    card.classList.add('admin-mode');
                });
                document.getElementById('saveOrderBtn').classList.remove('hidden');
                document.getElementById('saveChangesBtn').classList.remove('hidden');
                
                // Set button state based on unsaved changes
                if (unsavedChanges) {
                    document.getElementById('saveChangesBtn').classList.add('admin');
                } else {
                    document.getElementById('saveChangesBtn').classList.remove('admin');
                }
            }
        }

        // Drag and drop handlers
        function handleDragStart(e) {
            if (!document.body.classList.contains('admin-mode')) {
                e.preventDefault();
                return;
            }
            
            draggedItem = this;
            draggedItemIndex = parseInt(this.getAttribute('data-index'));
            
            // Store original order
            if (!orderChanged) {
                originalOrder = toolsData.map(tool => ({
                    id: tool.id,
                    order: tool.order !== undefined ? tool.order : 0
                }));
            }
            
            setTimeout(() => {
                this.classList.add('dragging');
            }, 0);
            
            // Create a drag image placeholder
            const dragImage = document.createElement('div');
            dragImage.style.width = '1px';
            dragImage.style.height = '1px';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            document.body.appendChild(dragImage);
            
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.getAttribute('data-tool-id'));
        }

        function handleDragEnd() {
            this.classList.remove('dragging');
            document.querySelectorAll('.drag-placeholder').forEach(el => el.remove());
            
            // Show save order button if order changed
            if (orderChanged) {
                document.getElementById('saveOrderBtn').classList.add('admin');
                unsavedChanges = true;
                updateSaveChangesButton();
            }
        }

        function handleDragOver(e) {
            if (!document.body.classList.contains('admin-mode')) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDragEnter(e) {
            if (!document.body.classList.contains('admin-mode')) return;
            e.preventDefault();
            
            if (this !== draggedItem) {
                dragOverItemIndex = parseInt(this.getAttribute('data-index'));
            }
        }

        function handleDragLeave() {
            if (!document.body.classList.contains('admin-mode')) return;
            // You might want to handle this for visual feedback
        }

        function handleDrop(e) {
            if (!document.body.classList.contains('admin-mode')) return;
            e.preventDefault();
            
            if (this === draggedItem) return;
            
            const dropIndex = parseInt(this.getAttribute('data-index'));
            
            // Update the order property of each item
            if (draggedItemIndex !== null && dropIndex !== null) {
                // Create a copy of the current order for reference
                const currentOrder = toolsData.map(tool => ({
                    id: tool.id,
                    order: tool.order
                }));
                
                const movedToolId = toolsData[draggedItemIndex].id;
                const targetToolId = toolsData[dropIndex].id;
                
                // Find the order values of the moved and target tools
                const movedToolOrder = currentOrder.find(item => item.id === movedToolId).order;
                const targetToolOrder = currentOrder.find(item => item.id === targetToolId).order;
                
                // Update orders based on drag direction
                if (movedToolOrder < targetToolOrder) {
                    // Moving down - decrement orders of tools between moved and target
                    toolsData.forEach(tool => {
                        const order = currentOrder.find(item => item.id === tool.id).order;
                        if (order > movedToolOrder && order <= targetToolOrder) {
                            tool.order = order - 1;
                        }
                    });
                    
                    // Set moved tool to target position
                    toolsData[draggedItemIndex].order = targetToolOrder;
                } else {
                    // Moving up - increment orders of tools between target and moved
                    toolsData.forEach(tool => {
                        const order = currentOrder.find(item => item.id === tool.id).order;
                        if (order >= targetToolOrder && order < movedToolOrder) {
                            tool.order = order + 1;
                        }
                    });
                    
                    // Set moved tool to target position
                    toolsData[draggedItemIndex].order = targetToolOrder;
                }
                
                orderChanged = true;
                unsavedChanges = true;
                renderDashboard();
                updateSaveChangesButton();
            }
        }

        // Update Save Changes button state
        function updateSaveChangesButton() {
            const saveChangesBtn = document.getElementById('saveChangesBtn');
            if (unsavedChanges) {
                saveChangesBtn.classList.add('admin');
            } else {
                saveChangesBtn.classList.remove('admin');
            }
        }

        // Handle Save Order button
        document.getElementById('saveOrderBtn').addEventListener('click', async function() {
            if (!orderChanged) {
                showStatusMessage('No order changes to save', 'info');
                return;
            }
            
            // Save to GitHub
            if (githubSettings.username && githubSettings.repo && githubSettings.token) {
                const button = document.getElementById('saveOrderBtn');
                const originalText = button.textContent;
                button.innerHTML = '<span class="loading-spinner"></span>Saving Order...';
                button.disabled = true;

                await saveConfigToGitHub();

                button.textContent = originalText;
                button.disabled = false;
                button.classList.remove('admin');
                
                orderChanged = false;
                unsavedChanges = false;
                updateSaveChangesButton();
            } else {
                // Save to localStorage
                try {
                    localStorage.setItem('dashboardTools', JSON.stringify(toolsData));
                    showStatusMessage('Order saved', 'success');
                    orderChanged = false;
                    unsavedChanges = false;
                    document.getElementById('saveOrderBtn').classList.remove('admin');
                    updateSaveChangesButton();
                } catch (e) {
                    console.warn('localStorage not available');
                    showStatusMessage('Could not save order', 'error');
                }
            }
        });

        // Handle Save Changes button
        document.getElementById('saveChangesBtn').addEventListener('click', async function() {
            if (!unsavedChanges) {
                showStatusMessage('No changes to save', 'info');
                return;
            }
            
            // Save to GitHub
            if (githubSettings.username && githubSettings.repo && githubSettings.token) {
                const button = document.getElementById('saveChangesBtn');
                const originalText = button.textContent;
                button.innerHTML = '<span class="loading-spinner"></span>Saving Changes...';
                button.disabled = true;

                await saveConfigToGitHub();

                button.textContent = originalText;
                button.disabled = false;
                button.classList.remove('admin');
                
                orderChanged = false;
                unsavedChanges = false;
                updateSaveChangesButton();
                
                // Also update the Save Order button state
                document.getElementById('saveOrderBtn').classList.remove('admin');
            } else {
                // Save to localStorage
                try {
                    localStorage.setItem('dashboardTools', JSON.stringify(toolsData));
                    showStatusMessage('Changes saved', 'success');
                    orderChanged = false;
                    unsavedChanges = false;
                    updateSaveChangesButton();
                    document.getElementById('saveOrderBtn').classList.remove('admin');
                } catch (e) {
                    console.warn('localStorage not available');
                    showStatusMessage('Could not save changes', 'error');
                }
            }
        });

        // Initialize color options in the edit panel
        function initializeColorOptions() {
            const colorOptionsContainer = document.getElementById('colorOptions');
            colorOptionsContainer.innerHTML = '';
            
            toolColors.forEach((color, index) => {
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                colorOption.style.backgroundColor = color;
                colorOption.setAttribute('data-color', color);
                
                colorOption.addEventListener('click', function() {
                    // Remove selected class from all options
                    document.querySelectorAll('.color-option').forEach(option => {
                        option.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                });
                
                colorOptionsContainer.appendChild(colorOption);
            });
        }

        // GitHub API functions
        async function fetchConfigFromGitHub() {
            if (!githubSettings.username || !githubSettings.repo || !githubSettings.token) {
                showStatusMessage('GitHub settings not configured', 'error');
                return null;
            }

            try {
                // First, check if the file exists
                const url = `https://api.github.com/repos/${githubSettings.username}/${githubSettings.repo}/contents/dashboard-config.json?ref=${githubSettings.branch}`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `token ${githubSettings.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (response.status === 404) {
                    // File doesn't exist yet, return null
                    return null;
                }

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                const data = await response.json();
                const content = atob(data.content); // Decode base64
                const config = JSON.parse(content);
                
                return {
                    toolsData: config.toolsData,
                    sha: data.sha // We need this for updating later
                };
            } catch (error) {
                console.error('Error fetching config from GitHub:', error);
                showStatusMessage('Failed to fetch configuration from GitHub', 'error');
                return null;
            }
        }

        async function saveConfigToGitHub() {
            if (!githubSettings.username || !githubSettings.repo || !githubSettings.token) {
                showStatusMessage('GitHub settings not configured', 'error');
                return false;
            }

            const configContent = JSON.stringify({ toolsData: toolsData }, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(configContent))); // UTF-8 safe base64 encoding

            try {
                // Check if the file already exists to get its SHA
                const checkUrl = `https://api.github.com/repos/${githubSettings.username}/${githubSettings.repo}/contents/dashboard-config.json?ref=${githubSettings.branch}`;
                
                const checkResponse = await fetch(checkUrl, {
                    headers: {
                        'Authorization': `token ${githubSettings.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                let sha;
                if (checkResponse.ok) {
                    const fileData = await checkResponse.json();
                    sha = fileData.sha;
                }

                // Now update or create the file
                const url = `https://api.github.com/repos/${githubSettings.username}/${githubSettings.repo}/contents/dashboard-config.json`;
                
                const payload = {
                    message: 'Update dashboard configuration',
                    content: encodedContent,
                    branch: githubSettings.branch
                };

                if (sha) {
                    payload.sha = sha;
                }

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubSettings.token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                showStatusMessage('Configuration saved to GitHub successfully', 'success');
                return true;
            } catch (error) {
                console.error('Error saving config to GitHub:', error);
                showStatusMessage('Failed to save configuration to GitHub', 'error');
                return false;
            }
        }

        async function testGitHubConnection() {
            const testUsername = document.getElementById('githubUsername').value;
            const testRepo = document.getElementById('githubRepo').value;
            const testToken = document.getElementById('githubToken').value;
            const testBranch = document.getElementById('githubBranch').value || 'main';

            if (!testUsername || !testRepo || !testToken) {
                showStatusMessage('Please fill in all GitHub settings', 'error');
                return false;
            }

            try {
                // Just try to access the repo
                const url = `https://api.github.com/repos/${testUsername}/${testRepo}`;
                
                const button = document.getElementById('testGithubConnection');
                const originalText = button.textContent;
                button.innerHTML = '<span class="loading-spinner"></span>Testing...';
                button.disabled = true;

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `token ${testToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                button.textContent = originalText;
                button.disabled = false;

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                showStatusMessage('GitHub connection successful!', 'success');
                return true;
            } catch (error) {
                console.error('Error testing GitHub connection:', error);
                showStatusMessage('GitHub connection failed', 'error');
                return false;
            }
        }

        function saveGitHubSettings() {
            const username = document.getElementById('githubUsername').value;
            const repo = document.getElementById('githubRepo').value;
            const token = document.getElementById('githubToken').value;
            const branch = document.getElementById('githubBranch').value || 'main';

            if (!username || !repo || !token) {
                showStatusMessage('Please fill in all GitHub settings', 'error');
                return;
            }

            // Save settings
            githubSettings = {
                username,
                repo,
                token,
                branch
            };

            // Store in localStorage
            try {
                localStorage.setItem('githubUsername', username);
                localStorage.setItem('githubRepo', repo);
                localStorage.setItem('githubToken', token); // In production, use encryption here
                localStorage.setItem('githubBranch', branch);
                
                showStatusMessage('GitHub settings saved successfully', 'success');
                document.getElementById('githubTokenPanel').style.display = 'none';
                
                // Try to load config from GitHub
                loadConfigFromGitHub();
            } catch (e) {
                console.warn('localStorage not available (likely due to sandbox restrictions)');
                showStatusMessage('Settings updated but could not be stored persistently', 'info');
                // Changes will still be visible but won't persist after page refresh in sandboxed environments
            }
        }

        async function loadConfigFromGitHub() {
            const button = document.getElementById('saveGithubSettings');
            if (button) {
                const originalText = button.textContent;
                button.innerHTML = '<span class="loading-spinner"></span>Loading...';
                button.disabled = true;

                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 3000);
            }

            const config = await fetchConfigFromGitHub();
            
            if (config && config.toolsData) {
                // Ensure each tool has quickLinks array and order property
                config.toolsData.forEach((tool, index) => {
                    if (!tool.quickLinks || !Array.isArray(tool.quickLinks)) {
                        tool.quickLinks = [
                            { title: '', url: '' },
                            { title: '', url: '' },
                            { title: '', url: '' },
                            { title: '', url: '' },
                            { title: '', url: '' },
                            { title: '', url: '' }
                        ];
                    }
                    
                    // Ensure there are exactly 6 quick links
                    while (tool.quickLinks.length < 6) {
                        tool.quickLinks.push({ title: '', url: '' });
                    }
                    
                    // Ensure order property exists
                    if (tool.order === undefined) {
                        tool.order = index;
                    }
                });
                
                toolsData = config.toolsData;
                renderDashboard();
                showStatusMessage('Configuration loaded from GitHub', 'success');
            } else if (config === null) {
                // Config doesn't exist yet, save the current config
                saveConfigToGitHub();
            }
        }

        // Admin mode functionality
        let isAdminMode = false;
        const adminPassword = "admin123"; // Simple demo password - in production use a more secure approach
        let currentToolId = null;

        // Toggle admin login panel
        document.getElementById('adminLoginBtn').addEventListener('click', function() {
            if (isAdminMode) {
                exitAdminMode();
            } else {
                document.getElementById('adminLoginPanel').style.display = 'block';
            }
        });

        // GitHub Login button event listener
        document.getElementById('githubLoginBtn').addEventListener('click', function() {
            // Populate the GitHub settings form with current values
            document.getElementById('githubUsername').value = githubSettings.username || '';
            document.getElementById('githubRepo').value = githubSettings.repo || '';
            document.getElementById('githubToken').value = githubSettings.token || '';
            document.getElementById('githubBranch').value = githubSettings.branch || 'main';
            
            // Show GitHub token panel
            document.getElementById('githubTokenPanel').style.display = 'block';
        });

        // Close admin login panel
        document.getElementById('cancelLogin').addEventListener('click', function() {
            document.getElementById('adminLoginPanel').style.display = 'none';
        });

        // Attempt login
        document.getElementById('loginAdmin').addEventListener('click', function() {
            const password = document.getElementById('adminPassword').value;
            if (password === adminPassword) {
                document.getElementById('adminLoginPanel').style.display = 'none';
                
                // Check if GitHub settings are configured
                if (!githubSettings.username || !githubSettings.repo || !githubSettings.token) {
                    // Show GitHub configuration panel
                    document.getElementById('githubTokenPanel').style.display = 'block';
                } else {
                    // GitHub already configured, enter admin mode
                    enterAdminMode();
                }
                
                document.getElementById('adminPassword').value = '';
            } else {
                showStatusMessage('Incorrect password', 'error');
            }
        });

        // Enter admin mode
        function enterAdminMode() {
            isAdminMode = true;
            document.body.classList.add('admin-mode');
            document.querySelectorAll('.tool-card').forEach(card => {
                card.classList.add('admin-mode');
            });
            document.getElementById('adminLoginBtn').textContent = 'Exit Admin Mode';
            document.getElementById('adminLoginBtn').classList.add('admin');
            document.getElementById('addToolBtn').classList.remove('hidden');
            document.getElementById('saveOrderBtn').classList.remove('hidden');
            document.getElementById('saveChangesBtn').classList.remove('hidden');
        }

        // Exit admin mode
        function exitAdminMode() {
            isAdminMode = false;
            document.body.classList.remove('admin-mode');
            document.querySelectorAll('.tool-card').forEach(card => {
                card.classList.remove('admin-mode');
            });
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('adminLoginBtn').textContent = 'Admin Login';
            document.getElementById('adminLoginBtn').classList.remove('admin');
            document.getElementById('addToolBtn').classList.add('hidden');
            document.getElementById('saveOrderBtn').classList.add('hidden');
            document.getElementById('saveChangesBtn').classList.add('hidden');

	// If changes were made but not saved, prompt user
            if (unsavedChanges) {
                if (confirm('You have unsaved changes. Do you want to save them before exiting admin mode?')) {
                    saveChanges();
                } else {
                    // Revert changes - reload from storage
                    loadStoredData();
                    unsavedChanges = false;
                }
            }
        }

        // Load data from storage (GitHub or localStorage)
        async function loadStoredData() {
            if (githubSettings.username && githubSettings.repo && githubSettings.token) {
                await loadConfigFromGitHub();
            } else {
                try {
                    const savedTools = localStorage.getItem('dashboardTools');
                    if (savedTools) {
                        toolsData = JSON.parse(savedTools);
                        renderDashboard();
                    }
                } catch (e) {
                    console.warn('Could not load from localStorage');
                }
            }
        }

        // Save any pending changes
        async function saveChanges() {
            if (!unsavedChanges) return;
            
            // Save to GitHub
            if (githubSettings.username && githubSettings.repo && githubSettings.token) {
                await saveConfigToGitHub();
            } else {
                // Save to localStorage
                try {
                    localStorage.setItem('dashboardTools', JSON.stringify(toolsData));
                    showStatusMessage('Changes saved', 'success');
                } catch (e) {
                    console.warn('localStorage not available');
                    showStatusMessage('Could not save changes', 'error');
                }
            }
            
            unsavedChanges = false;
            orderChanged = false;
            updateSaveChangesButton();
        }

        // Open edit panel for a specific tool
        function openEditPanel(toolId) {
            currentToolId = toolId;
            const tool = toolsData.find(t => t.id === toolId);
            
            if (!tool) return;
            
            // Populate form fields
            document.getElementById('toolIcon').value = tool.icon;
            document.getElementById('toolTitle').value = tool.title;
            document.getElementById('toolDescription').value = tool.description;
            document.getElementById('toolLink').value = tool.url;
            
            // Update icon preview
            document.getElementById('iconPreview').src = `icons_logos/${tool.icon}.svg`;
            
            // Set the selected color
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.remove('selected');
                if (option.getAttribute('data-color') === tool.color) {
                    option.classList.add('selected');
                }
            });
            
            // Populate quick links
            if (tool.quickLinks && Array.isArray(tool.quickLinks)) {
                for (let i = 0; i < Math.min(tool.quickLinks.length, 6); i++) {
                    document.getElementById(`quickLink${i+1}Title`).value = tool.quickLinks[i].title || '';
                    document.getElementById(`quickLink${i+1}Url`).value = tool.quickLinks[i].url || '';
                }
            } else {
                // Clear all quick link fields if no quick links exist
                for (let i = 1; i <= 6; i++) {
                    document.getElementById(`quickLink${i}Title`).value = '';
                    document.getElementById(`quickLink${i}Url`).value = '';
                }
            }
            
            // Show the panel
            document.getElementById('adminPanel').style.display = 'block';
        }

        // Open panel to create a new tool
        function openNewToolPanel() {
            currentToolId = null;
            
            // Clear all form fields
            document.getElementById('toolIcon').value = 'google-sheets';
            document.getElementById('toolTitle').value = '';
            document.getElementById('toolDescription').value = '';
            document.getElementById('toolLink').value = '';
            
            // Update icon preview
            document.getElementById('iconPreview').src = 'icons_logos/google-sheets.svg';
            
            // Set default color (first color)
            document.querySelectorAll('.color-option').forEach((option, index) => {
                option.classList.toggle('selected', index === 0);
            });
            
            // Clear all quick link fields
            for (let i = 1; i <= 6; i++) {
                document.getElementById(`quickLink${i}Title`).value = '';
                document.getElementById(`quickLink${i}Url`).value = '';
            }
            
            // Show the panel
            document.getElementById('adminPanel').style.display = 'block';
        }

        // Add Tool button
        document.getElementById('addToolBtn').addEventListener('click', function() {
            openNewToolPanel();
        });

        // Close admin panel
        document.getElementById('closeAdmin').addEventListener('click', function() {
            document.getElementById('adminPanel').style.display = 'none';
        });

        // Close GitHub panel
        document.getElementById('closeGithubPanel').addEventListener('click', function() {
            document.getElementById('githubTokenPanel').style.display = 'none';
            
            // If GitHub settings are configured, enter admin mode
            if (githubSettings.username && githubSettings.repo && githubSettings.token) {
                enterAdminMode();
            }
        });

        // Preview icon as user types
        document.getElementById('toolIcon').addEventListener('input', function() {
            document.getElementById('iconPreview').src = `icons_logos/${this.value}.svg`;
        });

        // Delete tool button
        document.getElementById('deleteToolBtn').addEventListener('click', async function() {
            if (currentToolId === null) {
                showStatusMessage('Cannot delete: no tool selected', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to delete this tool?')) {
                const toolIndex = toolsData.findIndex(t => t.id === currentToolId);
                if (toolIndex !== -1) {
                    // Get order of deleted tool
                    const deletedOrder = toolsData[toolIndex].order;
                    
                    // Remove the tool
                    toolsData.splice(toolIndex, 1);
                    
                    // Update order of remaining tools
                    toolsData.forEach(tool => {
                        if (tool.order > deletedOrder) {
                            tool.order--;
                        }
                    });
                    
                    // Mark as having unsaved changes
                    unsavedChanges = true;
                    
                    // Re-render the dashboard
                    renderDashboard();
                    
                    // Close the panel
                    document.getElementById('adminPanel').style.display = 'none';
                    showStatusMessage('Tool deleted. Remember to save your changes.', 'info');
                }
            }
        });

        // Save tool changes
        document.getElementById('saveToolChanges').addEventListener('click', function() {
            // Get form values
            const title = document.getElementById('toolTitle').value;
            const url = document.getElementById('toolLink').value;
            const description = document.getElementById('toolDescription').value;
            const icon = document.getElementById('toolIcon').value;
            
            // Get selected color
            let color = 'var(--turquoise)'; // Default
            const selectedColor = document.querySelector('.color-option.selected');
            if (selectedColor) {
                color = selectedColor.getAttribute('data-color');
            }
            
            // Get quick links
            const quickLinks = [];
            for (let i = 1; i <= 6; i++) {
                const linkTitle = document.getElementById(`quickLink${i}Title`).value;
                const linkUrl = document.getElementById(`quickLink${i}Url`).value;
                quickLinks.push({
                    title: linkTitle,
                    url: linkUrl
                });
            }
            
            if (currentToolId === null) {
                // Creating a new tool
                const newId = toolsData.length > 0 ? Math.max(...toolsData.map(t => t.id)) + 1 : 1;
                const newOrder = toolsData.length; // Place at the end
                
                toolsData.push({
                    id: newId,
                    icon,
                    title,
                    description,
                    url,
                    color,
                    order: newOrder,
                    quickLinks
                });
                showStatusMessage('New tool created. Remember to save your changes.', 'info');
            } else {
                // Updating existing tool
                const toolIndex = toolsData.findIndex(t => t.id === currentToolId);
                if (toolIndex !== -1) {
                    toolsData[toolIndex].icon = icon;
                    toolsData[toolIndex].title = title;
                    toolsData[toolIndex].description = description;
                    toolsData[toolIndex].url = url;
                    toolsData[toolIndex].color = color;
                    toolsData[toolIndex].quickLinks = quickLinks;
                    showStatusMessage('Tool updated. Remember to save your changes.', 'info');
                }
            }
            
            // Mark as having unsaved changes
            unsavedChanges = true;
            
            // Re-render the dashboard
            renderDashboard();
            
            // Close the panel
            document.getElementById('adminPanel').style.display = 'none';
        });

        // Test GitHub connection button
        document.getElementById('testGithubConnection').addEventListener('click', function() {
            testGitHubConnection();
        });

        // Save GitHub settings button
        document.getElementById('saveGithubSettings').addEventListener('click', function() {
            saveGitHubSettings();
        });

        // Status message function
        function showStatusMessage(message, type) {
            const statusElement = document.getElementById('statusMessage');
            statusElement.textContent = message;
            statusElement.className = 'status-message ' + type;
            statusElement.classList.add('show');
            
            setTimeout(() => {
                statusElement.classList.remove('show');
            }, 3000);
        }

        // Load settings from localStorage if available
        function loadSettings() {
            try {
                // Try to load GitHub settings
                const username = localStorage.getItem('githubUsername') || 'adamismyusername';
                const repo = localStorage.getItem('githubRepo') || 'sfdash';
                const token = localStorage.getItem('githubToken') || '';
                const branch = localStorage.getItem('githubBranch') || 'main';
                
                githubSettings = {
                    username,
                    repo,
                    token,
                    branch
                };
                
                // Populate GitHub settings form
                document.getElementById('githubUsername').value = username;
                document.getElementById('githubRepo').value = repo;
                document.getElementById('githubToken').value = token || '';
                document.getElementById('githubBranch').value = branch;
                
                // Try to load tools data from localStorage as fallback
                const savedTools = localStorage.getItem('dashboardTools');
                if (savedTools) {
                    try {
                        toolsData = JSON.parse(savedTools);
                        
                        // Ensure each tool has quickLinks array and order property
                        toolsData.forEach((tool, index) => {
                            if (!tool.quickLinks || !Array.isArray(tool.quickLinks)) {
                                tool.quickLinks = [
                                    { title: '', url: '' },
                                    { title: '', url: '' },
                                    { title: '', url: '' },
                                    { title: '', url: '' },
                                    { title: '', url: '' },
                                    { title: '', url: '' }
                                ];
                            }
                            // Ensure there are exactly 6 quick links
                            while (tool.quickLinks.length < 6) {
                                tool.quickLinks.push({ title: '', url: '' });
                            }
                            
                            // Ensure order property exists
                            if (tool.order === undefined) {
                                tool.order = index;
                            }
                        });
                    } catch (e) {
                        console.error('Error parsing saved tools data:', e);
                        initializeDefaultTools();
                    }
                } else {
                    initializeDefaultTools();
                }
            } catch (e) {
                console.warn('localStorage not available (likely due to sandbox restrictions)');
                // Continue with default data in sandboxed environments
                initializeDefaultTools();
            }
        }

        // Load config from GitHub for non-admin users (public read)
        async function loadPublicConfigFromGitHub() {
            if (!githubSettings.username || !githubSettings.repo) {
                return null;
            }
            
            try {
                // For public repositories, we can read without a token
                const url = `https://raw.githubusercontent.com/${githubSettings.username}/${githubSettings.repo}/${githubSettings.branch}/dashboard-config.json`;
                
                const response = await fetch(url);
                
                if (response.status === 404) {
                    console.log('Configuration file not found on GitHub');
                    return null;
                }
                
                if (!response.ok) {
                    throw new Error(`GitHub request error: ${response.status}`);
                }
                
                const config = await response.json();
                return config;
            } catch (error) {
                console.error('Error loading public config from GitHub:', error);
                return null;
            }
        }

        // Initialize the dashboard
        window.addEventListener('DOMContentLoaded', async function() {
            loadSettings();
            initializeColorOptions();
            
            // First try to load config from GitHub (this works for both admin and non-admin)
            if (githubSettings.username && githubSettings.repo) {
                let config;
                
                // Try using the API with token if in admin mode
                if (githubSettings.token) {
                    config = await fetchConfigFromGitHub();
                }
                
                // If that failed or no token available, try public access
                if (!config) {
                    config = await loadPublicConfigFromGitHub();
                }
                
                // If we got config, update the tools data
                if (config && config.toolsData) {
                    // Ensure each tool has quickLinks array and order property
                    config.toolsData.forEach((tool, index) => {
                        if (!tool.quickLinks || !Array.isArray(tool.quickLinks)) {
                            tool.quickLinks = [
                                { title: '', url: '' },
                                { title: '', url: '' },
                                { title: '', url: '' },
                                { title: '', url: '' },
                                { title: '', url: '' },
                                { title: '', url: '' }
                            ];
                        }
                        // Ensure there are exactly 6 quick links
                        while (tool.quickLinks.length < 6) {
                            tool.quickLinks.push({ title: '', url: '' });
                        }
                        
                        // Ensure order property exists
                        if (tool.order === undefined) {
                            tool.order = index;
                        }
                    });
                    
                    toolsData = config.toolsData;
                    
                    // Save to localStorage as backup
                    try {
                        localStorage.setItem('dashboardTools', JSON.stringify(toolsData));
                    } catch (e) {
                        console.warn('Could not save to localStorage');
                    }
                }
            }
            
            // Render the dashboard with whatever data we have
            renderDashboard();
        });

        // Function to automatically resize for iframe
        function resizeForIframe() {
            if (window.self !== window.top) {
                // We're in an iframe
                const height = document.body.scrollHeight;
                window.parent.postMessage({ type: 'resize', height }, '*');
            }
        }

        // Listen for window resize and content changes
        window.addEventListener('resize', resizeForIframe);
        window.addEventListener('load', resizeForIframe);

        // Check for iframe resize periodically
        setInterval(resizeForIframe, 500);

        // Listen for beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', function(e) {
            if (unsavedChanges) {
                // Standard way to show a confirmation dialog before leaving the page
                const confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
                e.returnValue = confirmationMessage;
                return confirmationMessage;
            }
        });
