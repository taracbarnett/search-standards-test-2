// Global data storage
let fieldsData = [];
let standardsData = [];
let componentsData = [];
let currentFieldSelection = null;
let currentStandardSelection = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    setupEventListeners();
    restoreLastSession();
    // Initialize tooltips on page load
    initializeTooltips();
});

// Load CSV data from GitHub
async function loadCSVData() {
    try {
        // Update these paths to match your repository structure
        const csvFiles = {
            fields: 'data/fields-data.csv',
            standards: 'data/standards-data.csv',
            components: 'data/standard-components-data.csv'
        };

        // Fetch CSV files
        const [fieldsResponse, standardsResponse, componentsResponse] = await Promise.all([
            fetch(csvFiles.fields),
            fetch(csvFiles.standards),
            fetch(csvFiles.components)
        ]);

        if (!fieldsResponse.ok || !standardsResponse.ok || !componentsResponse.ok) {
            throw new Error('Failed to fetch CSV files');
        }

        const fieldsCSV = await fieldsResponse.text();
        const standardsCSV = await standardsResponse.text();
        const componentsCSV = await componentsResponse.text();

        fieldsData = Papa.parse(fieldsCSV, { header: true, skipEmptyLines: true }).data;
        standardsData = Papa.parse(standardsCSV, { header: true, skipEmptyLines: true }).data;
        componentsData = Papa.parse(componentsCSV, { header: true, skipEmptyLines: true }).data;

        populateModuleSelect();
        populateStandardSelect();
        updateFieldList();
    } catch (error) {
        console.log('CSV files not found, loading sample data for demonstration...');
        // For demonstration purposes, load sample data if CSV files are not available
        loadSampleData();
    }
}

// Sample data for demonstration (remove this in production)
function loadSampleData() {
    console.log('Loading sample data for demonstration...');
    
    fieldsData = [
        {
            fieldName: "Add contacts modal search",
            module: "Add contacts modal",
            snapshotLink: null,
            screenshot: "https://placehold.co/600x300/4C7EA5/FFFFFF?text=Add+Contacts+Modal+Search",
            "Wildcards should use * for Multicharacter Searches": true,
            "Wildcards should use ? for single character replacement": true,
            "Wildcards also do this thing": null,
            "Second search 1": true,
            "Second search 2": "other text",
            "Third search 1": false,
            "Supports exact phrase searching": true,
            "Case-insensitive searching": false,
            "Boolean operators (AND, OR, NOT)": "partial support",
            "Range searching": null
        },
        {
            fieldName: "Item Barcode",
            module: "Circulation log",
            snapshotLink: "https://folio-snapshot.dev.folio.org/some-page",
            screenshot: "https://placehold.co/600x300/5D6883/FFFFFF?text=Item+Barcode+Field",
            "Wildcards should use * for Multicharacter Searches": false,
            "Wildcards should use ? for single character replacement": true,
            "Wildcards also do this thing": "partial support",
            "Second search 1": false,
            "Second search 2": true,
            "Third search 1": true,
            "Supports exact phrase searching": true,
            "Case-insensitive searching": true,
            "Boolean operators (AND, OR, NOT)": false,
            "Range searching": "limited support"
        },
        {
            fieldName: "User Search",
            module: "Users",
            snapshotLink: "https://folio-snapshot.dev.folio.org/users",
            screenshot: "https://placehold.co/600x300/FF674C/FFFFFF?text=User+Search+Interface",
            "Wildcards should use * for Multicharacter Searches": true,
            "Wildcards should use ? for single character replacement": false,
            "Wildcards also do this thing": true,
            "Second search 1": true,
            "Second search 2": false,
            "Third search 1": "needs improvement",
            "Supports exact phrase searching": false,
            "Case-insensitive searching": true,
            "Boolean operators (AND, OR, NOT)": true,
            "Range searching": false
        },
        {
            fieldName: "Title Search",
            module: "Inventory",
            snapshotLink: "https://folio-snapshot.dev.folio.org/inventory",
            screenshot: null,
            "Wildcards should use * for Multicharacter Searches": true,
            "Wildcards should use ? for single character replacement": true,
            "Wildcards also do this thing": false,
            "Second search 1": "not implemented",
            "Second search 2": true,
            "Third search 1": true,
            "Supports exact phrase searching": true,
            "Case-insensitive searching": true,
            "Boolean operators (AND, OR, NOT)": "full support",
            "Range searching": true
        },
        {
            fieldName: "Author Search",
            module: "Inventory",
            snapshotLink: "https://folio-snapshot.dev.folio.org/inventory",
            screenshot: "https://placehold.co/600x300/EFEFEF/3B3B3B?text=Author+Search+Field",
            "Wildcards should use * for Multicharacter Searches": false,
            "Wildcards should use ? for single character replacement": false,
            "Wildcards also do this thing": "under development",
            "Second search 1": true,
            "Second search 2": true,
            "Third search 1": false,
            "Supports exact phrase searching": true,
            "Case-insensitive searching": false,
            "Boolean operators (AND, OR, NOT)": false,
            "Range searching": null
        },
        {
            fieldName: "Patron Search",
            module: "Check out",
            snapshotLink: null,
            screenshot: "https://dummyimage.com/600x300/4C7EA5/FFFFFF&text=Patron+Search",
            "Wildcards should use * for Multicharacter Searches": true,
            "Wildcards should use ? for single character replacement": true,
            "Wildcards also do this thing": true,
            "Second search 1": false,
            "Second search 2": "experimental",
            "Third search 1": true,
            "Supports exact phrase searching": false,
            "Case-insensitive searching": true,
            "Boolean operators (AND, OR, NOT)": null,
            "Range searching": false
        }
    ];

    standardsData = [
        {
            standardName: "Wildcard Searching",
            standardDefinition: "Wildcard searching should be standard across all search fields to allow flexible pattern matching",
            wikiLink: "https://folio-org.atlassian.net/wiki/spaces/AppInt/pages/4098958/Search+expectations+across+apps",
            jiraLink: "https://folio-org.atlassian.net/browse/UXPROD-4545"
        },
        {
            standardName: "Advanced Search Features",
            standardDefinition: "Advanced search capabilities including boolean operators and phrase searching",
            wikiLink: "https://folio-org.atlassian.net/wiki/spaces/AppInt/pages/4098958/Search+expectations+across+apps",
            jiraLink: "https://folio-org.atlassian.net/browse/UXPROD-4546"
        },
        {
            standardName: "Basic Search Behavior",
            standardDefinition: "Fundamental search behaviors that should be consistent across all modules",
            wikiLink: "https://folio-org.atlassian.net/wiki/spaces/AppInt/pages/4098958/Search+expectations+across+apps",
            jiraLink: "https://folio-org.atlassian.net/browse/UXPROD-4547"
        }
    ];

    componentsData = [
        {
            standardComponent: "Wildcards should use * for Multicharacter Searches",
            standardName: "Wildcard Searching",
            definition: "The asterisk (*) should replace zero or more characters in search terms"
        },
        {
            standardComponent: "Wildcards should use ? for single character replacement",
            standardName: "Wildcard Searching",
            definition: "The question mark (?) should replace exactly one character in search terms"
        },
        {
            standardComponent: "Wildcards also do this thing",
            standardName: "Wildcard Searching",
            definition: "Additional wildcard functionality for advanced pattern matching"
        },
        {
            standardComponent: "Supports exact phrase searching",
            standardName: "Advanced Search Features",
            definition: "Users should be able to search for exact phrases using quotation marks"
        },
        {
            standardComponent: "Boolean operators (AND, OR, NOT)",
            standardName: "Advanced Search Features",
            definition: "Support for boolean logic in search queries to combine or exclude terms"
        },
        {
            standardComponent: "Range searching",
            standardName: "Advanced Search Features",
            definition: "Ability to search within specified ranges (dates, numbers, etc.)"
        },
        {
            standardComponent: "Second search 1",
            standardName: "Basic Search Behavior",
            definition: "Core search functionality component one"
        },
        {
            standardComponent: "Second search 2",
            standardName: "Basic Search Behavior",
            definition: "Core search functionality component two"
        },
        {
            standardComponent: "Third search 1",
            standardName: "Basic Search Behavior",
            definition: "Additional basic search behavior requirement"
        },
        {
            standardComponent: "Case-insensitive searching",
            standardName: "Basic Search Behavior",
            definition: "Search should not be case-sensitive by default"
        }
    ];

    populateModuleSelect();
    populateStandardSelect();
    updateFieldList();
}

function setupEventListeners() {
    document.getElementById('moduleSelect').addEventListener('change', updateFieldList);
    document.getElementById('fieldSearch').addEventListener('input', updateFieldList);
    document.getElementById('fieldSelect').addEventListener('change', showFieldDetails);
    document.getElementById('standardSelect').addEventListener('change', showStandardDetails);
    
    // Table filter listeners
    document.getElementById('tableFieldFilter').addEventListener('input', filterComplianceTable);
    document.getElementById('tableModuleFilter').addEventListener('change', filterComplianceTable);
    document.getElementById('complianceFilter').addEventListener('change', filterComplianceTable);
    
    // Tab change listeners to save state
    document.getElementById('behavior-tab').addEventListener('shown.bs.tab', saveCurrentState);
    document.getElementById('compliance-tab').addEventListener('shown.bs.tab', saveCurrentState);
}

function populateModuleSelect() {
    const moduleSelect = document.getElementById('moduleSelect');
    const tableModuleFilter = document.getElementById('tableModuleFilter');
    const modules = [...new Set(fieldsData.map(field => field.module))].sort();
    
    // Populate behavior tab module select
    moduleSelect.innerHTML = '<option value="">All Modules</option>';
    modules.forEach(module => {
        if (module) {
            moduleSelect.innerHTML += `<option value="${module}">${module}</option>`;
        }
    });
    
    // Populate compliance tab table module filter
    tableModuleFilter.innerHTML = '<option value="">All Modules</option>';
    modules.forEach(module => {
        if (module) {
            tableModuleFilter.innerHTML += `<option value="${module}">${module}</option>`;
        }
    });
}

function populateStandardSelect() {
    const standardSelect = document.getElementById('standardSelect');
    
    // Create array of standards with their original indices
    const standardsWithIndex = standardsData.map((standard, index) => ({
        ...standard,
        originalIndex: index
    }));
    
    // Sort standards alphabetically by name
    standardsWithIndex.sort((a, b) => {
        const nameA = a.standardName ? a.standardName.toLowerCase() : '';
        const nameB = b.standardName ? b.standardName.toLowerCase() : '';
        return nameA.localeCompare(nameB);
    });
    
    standardSelect.innerHTML = '<option value="">Choose a standard...</option>';
    standardsWithIndex.forEach((standard) => {
        if (standard.standardName) {
            standardSelect.innerHTML += `<option value="${standard.originalIndex}">${standard.standardName}</option>`;
        }
    });
}

function updateFieldList() {
    const moduleFilter = document.getElementById('moduleSelect').value;
    const searchFilter = document.getElementById('fieldSearch').value.toLowerCase();
    const fieldSelect = document.getElementById('fieldSelect');
    
    let filteredFields = fieldsData;
    
    if (moduleFilter) {
        filteredFields = filteredFields.filter(field => field.module === moduleFilter);
    }
    
    if (searchFilter) {
        filteredFields = filteredFields.filter(field => 
            field.fieldName && field.fieldName.toLowerCase().includes(searchFilter)
        );
    }
    
    // Sort filtered fields alphabetically by field name
    filteredFields.sort((a, b) => {
        const nameA = a.fieldName ? a.fieldName.toLowerCase() : '';
        const nameB = b.fieldName ? b.fieldName.toLowerCase() : '';
        return nameA.localeCompare(nameB);
    });
    
    fieldSelect.innerHTML = '<option value="">Select a field...</option>';
    filteredFields.forEach((field, index) => {
        if (field.fieldName) {
            const originalIndex = fieldsData.indexOf(field);
            fieldSelect.innerHTML += `<option value="${originalIndex}">${field.fieldName}</option>`;
        }
    });
}

function showFieldDetails() {
    const fieldIndex = document.getElementById('fieldSelect').value;
    if (!fieldIndex) {
        document.getElementById('behaviorResults').innerHTML = `
            <div class="text-center text-muted mt-5">
                <h4>Select a field to view its search behavior analysis</h4>
            </div>
        `;
        return;
    }

    const field = fieldsData[fieldIndex];
    currentFieldSelection = fieldIndex;
    saveCurrentState();

    let html = `
        <div class="card">
            <div class="field-header">
                <h3>${field.fieldName}</h3>
                <p class="mb-1"><strong>Module:</strong> ${field.module}</p>
                ${field.snapshotLink ? `<p class="mb-0"><a href="${field.snapshotLink}" target="_blank" class="text-white">View in Snapshot</a></p>` : ''}
            </div>
            <div class="card-body">
                ${field.screenshot ? `
                    <div class="screenshot-container">
                        <img src="${field.screenshot}" alt="Screenshot of ${field.fieldName}" 
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                        <div class="screenshot-placeholder" style="display: none;">
                            <i class="bi bi-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                            <div>Screenshot: ${field.fieldName}</div>
                            <small>Image could not be loaded</small>
                        </div>
                    </div>
                ` : ''}
    `;

    // Group components by standard
    const standardGroups = {};
    componentsData.forEach(component => {
        if (!standardGroups[component.standardName]) {
            standardGroups[component.standardName] = [];
        }
        standardGroups[component.standardName].push(component);
    });

    // Display each standard and its components
    Object.keys(standardGroups).forEach((standardName, index) => {
        const standard = standardsData.find(s => s.standardName === standardName);
        if (!standard) return;

        const components = standardGroups[standardName];
        let standardCompliance = calculateStandardCompliance(field, components);
        
        html += `
            <div class="standard-section">
                <h4 class="clickable" onclick="navigateToStandard('${standardName}')">
                    ${getComplianceIndicator(standardCompliance)}
                    ${standardName}
                </h4>
                <p class="text-muted">${standard.standardDefinition}</p>
                <div class="component-list">
        `;

        components.forEach(component => {
            const compliance = getFieldCompliance(field, component.standardComponent);
            const complianceText = getComplianceText(field, component.standardComponent);
            
            html += `
                <div class="mb-2">
                    <div class="d-flex align-items-center">
                        <span class="compliance-indicator ${getComplianceClass(compliance)}" 
                              ${complianceText ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${complianceText}"` : ''}>
                            ${getComplianceSymbol(compliance)}
                        </span>
                        <span class="clickable" onclick="navigateToComponent('${component.standardComponent}')" 
                              data-bs-toggle="tooltip" data-bs-placement="right" title="${component.definition}">
                            ${component.standardComponent}
                        </span>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
    });

    html += '</div></div>';
    document.getElementById('behaviorResults').innerHTML = html;
    
    // Initialize tooltips for the new content
    initializeTooltips();
}

function showStandardDetails() {
    const standardIndex = document.getElementById('standardSelect').value;
    if (!standardIndex) {
        document.getElementById('complianceResults').innerHTML = `
            <div class="text-center text-muted mt-5">
                <h4>Select a standard to view compliance data</h4>
            </div>
        `;
        document.getElementById('tableFiltersCard').style.display = 'none';
        return;
    }

    const standard = standardsData[standardIndex];
    currentStandardSelection = standardIndex;
    saveCurrentState();

    // Show table filters card
    document.getElementById('tableFiltersCard').style.display = 'block';

    const components = componentsData.filter(c => c.standardName === standard.standardName);
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>${standard.standardName}</h3>
                <p class="mb-1">${standard.standardDefinition}</p>
                <div class="mt-2">
                    ${standard.wikiLink ? `<a href="${standard.wikiLink}" target="_blank" class="btn btn-sm btn-outline-primary me-2">Wiki Page</a>` : ''}
                    ${standard.jiraLink ? `<a href="${standard.jiraLink}" target="_blank" class="btn btn-sm btn-outline-primary">Jira</a>` : ''}
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped" id="complianceTable">
                        <thead>
                            <tr>
                                <th>Field Name</th>
                                <th>Module</th>
    `;

    components.forEach(component => {
        html += `<th><span data-bs-toggle="tooltip" data-bs-placement="top" title="${component.definition}">${component.standardComponent}</span></th>`;
    });

    html += `
                            </tr>
                        </thead>
                        <tbody id="complianceTableBody">
    `;

    // Sort fields alphabetically by field name before adding to table
    const sortedFields = [...fieldsData].sort((a, b) => {
        const nameA = a.fieldName ? a.fieldName.toLowerCase() : '';
        const nameB = b.fieldName ? b.fieldName.toLowerCase() : '';
        return nameA.localeCompare(nameB);
    });

    sortedFields.forEach((field) => {
        if (!field.fieldName) return;
        
        const fieldIndex = fieldsData.indexOf(field);
        
        // Calculate overall compliance for this field
        let fieldCompliances = [];
        components.forEach(component => {
            fieldCompliances.push(getFieldCompliance(field, component.standardComponent));
        });
        
        const overallCompliance = calculateOverallFieldCompliance(fieldCompliances);
        
        html += `
            <tr data-field-name="${field.fieldName.toLowerCase()}" data-module="${field.module}" data-compliance="${overallCompliance}">
                <td><span class="clickable" onclick="navigateToField(${fieldIndex})">${field.fieldName}</span></td>
                <td>${field.module}</td>
        `;

        components.forEach(component => {
            const compliance = getFieldCompliance(field, component.standardComponent);
            const complianceText = getComplianceText(field, component.standardComponent);
            
            html += `
                <td class="text-center">
                    <span class="compliance-indicator ${getComplianceClass(compliance)}" 
                          ${complianceText ? `data-bs-toggle="tooltip" data-bs-placement="top" title="${complianceText}"` : ''}>
                        ${getComplianceSymbol(compliance)}
                    </span>
                </td>
            `;
        });

        html += '</tr>';
    });

    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('complianceResults').innerHTML = html;
    
    // Initialize tooltips for the new content
    initializeTooltips();
}

function getFieldCompliance(field, componentName) {
    const value = field[componentName];
    if (value === true || value === 'TRUE') return 'full';
    if (value === false || value === 'FALSE') return 'none';
    if (value === null || value === undefined || value === '') return 'unknown';
    return 'partial';
}

function getComplianceText(field, componentName) {
    const value = field[componentName];
    if (value !== true && value !== false && value !== 'TRUE' && value !== 'FALSE' && 
        value !== null && value !== undefined && value !== '') {
        return String(value);
    }
    return '';
}

function calculateStandardCompliance(field, components) {
    let full = 0, partial = 0, none = 0, unknown = 0;
    
    components.forEach(component => {
        const compliance = getFieldCompliance(field, component.standardComponent);
        switch (compliance) {
            case 'full': full++; break;
            case 'partial': partial++; break;
            case 'none': none++; break;
            case 'unknown': unknown++; break;
        }
    });

    if (full === components.length) return 'full';
    if (none === components.length) return 'none';
    if (unknown === components.length) return 'unknown';
    return 'partial';
}

function calculateOverallFieldCompliance(compliances) {
    if (compliances.every(c => c === 'full')) return 'full';
    if (compliances.every(c => c === 'none')) return 'none';
    if (compliances.every(c => c === 'unknown')) return 'unknown';
    return 'partial';
}

function filterComplianceTable() {
    const table = document.getElementById('complianceTable');
    if (!table) return;
    
    const fieldFilter = document.getElementById('tableFieldFilter').value.toLowerCase();
    const moduleFilter = document.getElementById('tableModuleFilter').value;
    const complianceFilter = document.getElementById('complianceFilter').value;
    
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    let visibleCount = 0;
    
    rows.forEach(row => {
        const fieldName = row.dataset.fieldName;
        const module = row.dataset.module;
        const compliance = row.dataset.compliance;
        
        let show = true;
        
        // Apply field name filter
        if (fieldFilter && !fieldName.includes(fieldFilter)) {
            show = false;
        }
        
        // Apply module filter
        if (moduleFilter && module !== moduleFilter) {
            show = false;
        }
        
        // Apply compliance filter
        if (complianceFilter && compliance !== complianceFilter) {
            show = false;
        }
        
        if (show) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show/hide "no results" message
    let noResultsRow = tbody.querySelector('.no-results-row');
    if (visibleCount === 0) {
        if (!noResultsRow) {
            const colspan = table.querySelector('thead tr').children.length;
            noResultsRow = document.createElement('tr');
            noResultsRow.className = 'no-results-row';
            noResultsRow.innerHTML = `<td colspan="${colspan}" class="text-center text-muted py-4">No fields match the current filters</td>`;
            tbody.appendChild(noResultsRow);
        }
        noResultsRow.style.display = '';
    } else if (noResultsRow) {
        noResultsRow.style.display = 'none';
    }
}

function resetTableFilters() {
    document.getElementById('tableFieldFilter').value = '';
    document.getElementById('tableModuleFilter').value = '';
    document.getElementById('complianceFilter').value = '';
    filterComplianceTable();
}

function getComplianceIndicator(compliance) {
    return `<span class="compliance-indicator ${getComplianceClass(compliance)}">${getComplianceSymbol(compliance)}</span>`;
}

function getComplianceClass(compliance) {
    switch (compliance) {
        case 'full': return 'compliance-full';
        case 'partial': return 'compliance-partial';
        case 'none': return 'compliance-none';
        case 'unknown': return 'compliance-unknown';
        default: return 'compliance-unknown';
    }
}

function getComplianceSymbol(compliance) {
    switch (compliance) {
        case 'full': return '✓';
        case 'partial': return '–';
        case 'none': return '✗';
        case 'unknown': return '?';
        default: return '?';
    }
}

function initializeTooltips() {
    // Dispose of existing tooltips first
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(element => {
        const existingTooltip = bootstrap.Tooltip.getInstance(element);
        if (existingTooltip) {
            existingTooltip.dispose();
        }
    });
    
    // Initialize new tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function navigateToStandard(standardName) {
    const standardIndex = standardsData.findIndex(s => s.standardName === standardName);
    if (standardIndex >= 0) {
        document.getElementById('standardSelect').value = standardIndex;
        const complianceTab = new bootstrap.Tab(document.getElementById('compliance-tab'));
        complianceTab.show();
        showStandardDetails();
    }
}

function navigateToComponent(componentName) {
    const component = componentsData.find(c => c.standardComponent === componentName);
    if (component) {
        navigateToStandard(component.standardName);
    }
}

function navigateToField(fieldIndex) {
    document.getElementById('fieldSelect').value = fieldIndex;
    const behaviorTab = new bootstrap.Tab(document.getElementById('behavior-tab'));
    behaviorTab.show();
    showFieldDetails();
}

function resetBehaviorSearch() {
    document.getElementById('moduleSelect').value = '';
    document.getElementById('fieldSearch').value = '';
    document.getElementById('fieldSelect').value = '';
    updateFieldList();
    document.getElementById('behaviorResults').innerHTML = `
        <div class="text-center text-muted mt-5">
            <h4>Select a field to view its search behavior analysis</h4>
        </div>
    `;
    currentFieldSelection = null;
    saveCurrentState();
}

function resetComplianceSearch() {
    document.getElementById('standardSelect').value = '';
    document.getElementById('complianceResults').innerHTML = `
        <div class="text-center text-muted mt-5">
            <h4>Select a standard to view compliance data</h4>
        </div>
    `;
    document.getElementById('tableFiltersCard').style.display = 'none';
    resetTableFilters();
    currentStandardSelection = null;
    saveCurrentState();
}

function saveCurrentState() {
    const currentState = {
        activeTab: document.querySelector('#mainTabs .nav-link.active').id,
        fieldSelection: currentFieldSelection,
        standardSelection: currentStandardSelection,
        moduleFilter: document.getElementById('moduleSelect').value,
        fieldSearch: document.getElementById('fieldSearch').value
    };
    sessionStorage.setItem('folioSearchState', JSON.stringify(currentState));
}

function restoreLastSession() {
    setTimeout(() => {
        const savedState = sessionStorage.getItem('folioSearchState');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Restore tab
            if (state.activeTab === 'compliance-tab') {
                const complianceTab = new bootstrap.Tab(document.getElementById('compliance-tab'));
                complianceTab.show();
                
                if (state.standardSelection) {
                    document.getElementById('standardSelect').value = state.standardSelection;
                    showStandardDetails();
                }
            } else {
                // Restore behavior tab state
                if (state.moduleFilter) {
                    document.getElementById('moduleSelect').value = state.moduleFilter;
                }
                if (state.fieldSearch) {
                    document.getElementById('fieldSearch').value = state.fieldSearch;
                }
                updateFieldList();
                
                if (state.fieldSelection) {
                    setTimeout(() => {
                        document.getElementById('fieldSelect').value = state.fieldSelection;
                        showFieldDetails();
                    }, 100);
                }
            }
        }
    }, 100);
}
