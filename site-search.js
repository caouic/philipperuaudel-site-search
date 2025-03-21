/**
 * PhilippeRuaudel-SiteSearch
 * A lightweight, customizable search solution for websites
 * 
 * @author Philippe Ruaudel
 * @license MIT
 * @version 1.0.0
 */

class SiteSearch {
    constructor(config = {}) {
        // Default configuration
        this.config = {
            // Appearance
            showSearchButton: true,
            searchButtonPosition: 'bottom-right',
            searchButtonColor: '#4a6fa5',
            accentColor: '#4cb5ae',
            secondaryColor: '#166088',
            searchButtonSelector: null,
            
            // Content
            dataEndpoint: null,
            apiKey: null,
            resourceId: null,
            siteContent: null,
            
            // Search settings
            resultsPerPage: 5,
            searchPlaceholder: 'What are you looking for?',
            popupTitle: 'Search',
            
            // Customization
            noResultsText: 'No results found',
            searchButtonText: '🔍',
            loadingText: 'Loading...',
            errorText: 'Error loading content',
            
            // Callbacks
            onSearch: null,
            onResultClick: null
        };
        
        // Merge user configuration with defaults
        this.config = { ...this.config, ...config };
        
        // Initialize state
        this.siteContent = [];
        this.searchResults = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.hasError = false;
        this.searchTerm = '';
        
        // Initialize UI elements
        this.searchContainer = null;
        this.searchInput = null;
        this.resultsContainer = null;
        this.paginationContainer = null;
        
        // Initialize the search
        this.init();
    }
    
    /**
     * Initialize the search functionality
     */
    init() {
        // Load site content
        this.loadSiteContent();
        
        // Create search UI
        this.createSearchUI();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Load site content from the specified source
     */
    loadSiteContent() {
        // If site content is provided directly, use it
        if (this.config.siteContent) {
            this.siteContent = this.config.siteContent;
            return;
        }
        
        // If no data endpoint is provided, show error
        if (!this.config.dataEndpoint) {
            console.error('SiteSearch: No data source provided. Please provide either siteContent or dataEndpoint.');
            this.hasError = true;
            return;
        }
        
        // Set loading state
        this.isLoading = true;
        
        // Prepare the endpoint URL
        let endpoint = this.config.dataEndpoint;
        
        // Replace :resourceId placeholder if resourceId is provided
        if (this.config.resourceId && endpoint.includes(':resourceId')) {
            endpoint = endpoint.replace(':resourceId', this.config.resourceId);
        }
        
        // Prepare fetch options
        const fetchOptions = {
            method: 'GET',
            headers: {}
        };
        
        // Add API key if provided
        if (this.config.apiKey) {
            fetchOptions.headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        
        // Fetch data from endpoint
        fetch(endpoint, fetchOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Process the data based on its structure
                this.processData(data);
                this.isLoading = false;
            })
            .catch(error => {
                console.error('SiteSearch: Error loading content:', error);
                this.hasError = true;
                this.isLoading = false;
            });
    }
    
    /**
     * Process the data based on its structure
     * Supports various API response formats
     */
    processData(data) {
        try {
            // Case 1: Data is already an array of content items
            if (Array.isArray(data)) {
                this.siteContent = data.map(item => this.normalizeContentItem(item));
                return;
            }
            
            // Case 2: Data is encapsulated in a 'data' property (common API pattern)
            if (data.data && Array.isArray(data.data)) {
                this.siteContent = data.data.map(item => this.normalizeContentItem(item));
                return;
            }
            
            // Case 3: Data is in a different format - try to extract content items
            // This is a fallback for unknown API formats
            const possibleArrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
            
            if (possibleArrayProps.length > 0) {
                // Use the first array property found
                const arrayProp = possibleArrayProps[0];
                this.siteContent = data[arrayProp].map(item => this.normalizeContentItem(item));
                return;
            }
            
            // If we can't determine the structure, log an error
            console.error('SiteSearch: Unable to process data. Unknown data structure:', data);
            this.hasError = true;
        } catch (error) {
            console.error('SiteSearch: Error processing data:', error);
            this.hasError = true;
        }
    }
    
    /**
     * Normalize a content item to ensure it has all required properties
     */
    normalizeContentItem(item) {
        return {
            id: item.id || item._id || '',
            title: item.title || '',
            content: item.content || item.description || item.text || '',
            url: item.url || item.link || '',
            type: item.type || item.category || '',
            date: item.date || item.publishedAt || item.created || ''
        };
    }
    
    /**
     * Create the search UI elements
     */
    createSearchUI() {
        // Create search button if enabled
        if (this.config.showSearchButton) {
            this.createSearchButton();
        } else if (this.config.searchButtonSelector) {
            // Use existing button
            const existingButton = document.querySelector(this.config.searchButtonSelector);
            if (existingButton) {
                existingButton.addEventListener('click', () => this.openSearch());
            } else {
                console.error(`SiteSearch: No element found with selector "${this.config.searchButtonSelector}"`);
            }
        }
        
        // Create search container
        this.createSearchContainer();
    }
    
    /**
     * Create the search button
     */
    createSearchButton() {
        const button = document.createElement('button');
        button.className = `site-search-trigger ${this.config.searchButtonPosition}`;
        button.innerHTML = this.config.searchButtonText;
        button.setAttribute('aria-label', 'Search');
        button.style.backgroundColor = this.config.searchButtonColor;
        
        button.addEventListener('click', () => this.openSearch());
        
        document.body.appendChild(button);
    }
    
    /**
     * Create the search container
     */
    createSearchContainer() {
        // Create container
        this.searchContainer = document.createElement('div');
        this.searchContainer.className = 'site-search-container';
        this.searchContainer.style.display = 'none';
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'site-search-overlay';
        overlay.addEventListener('click', () => this.closeSearch());
        
        // Create search modal
        const modal = document.createElement('div');
        modal.className = 'site-search-modal';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'site-search-header';
        
        const title = document.createElement('h3');
        title.className = 'site-search-title';
        title.textContent = this.config.popupTitle;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'site-search-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.addEventListener('click', () => this.closeSearch());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Create search input
        const searchForm = document.createElement('form');
        searchForm.className = 'site-search-form';
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });
        
        this.searchInput = document.createElement('input');
        this.searchInput.className = 'site-search-input';
        this.searchInput.type = 'text';
        this.searchInput.placeholder = this.config.searchPlaceholder;
        this.searchInput.addEventListener('input', () => this.performSearch());
        
        searchForm.appendChild(this.searchInput);
        
        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'site-search-results';
        
        // Create pagination container
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.className = 'site-search-pagination';
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(searchForm);
        modal.appendChild(this.resultsContainer);
        modal.appendChild(this.paginationContainer);
        
        // Assemble container
        this.searchContainer.appendChild(overlay);
        this.searchContainer.appendChild(modal);
        
        // Add to document
        document.body.appendChild(this.searchContainer);
        
        // Add CSS variables
        this.addCSSVariables();
        
        // Add CSS styles
        this.addCSSStyles();
    }
    
    /**
     * Add CSS variables for theming
     */
    addCSSVariables() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --site-search-accent-color: ${this.config.accentColor};
                --site-search-secondary-color: ${this.config.secondaryColor};
                --site-search-text-color: #333;
                --site-search-background-color: #fff;
                --site-search-border-color: #ddd;
                --site-search-overlay-color: rgba(0, 0, 0, 0.5);
                --site-search-shadow-color: rgba(0, 0, 0, 0.1);
                --site-search-highlight-color: #f5f5f5;
                --site-search-card-shadow: 0 2px 5px var(--site-search-shadow-color);
                --site-search-transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add CSS styles for the search UI
     */
    addCSSStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Search Container */
            .site-search-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            /* Search Trigger Button */
            .site-search-trigger {
                position: fixed;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: var(--site-search-accent-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: var(--site-search-card-shadow);
                transition: var(--site-search-transition);
                border: none;
                font-size: 24px;
                z-index: 9998;
            }
            
            .site-search-trigger.bottom-right {
                bottom: 30px;
                right: 30px;
            }
            
            .site-search-trigger.bottom-left {
                bottom: 30px;
                left: 30px;
            }
            
            .site-search-trigger.top-right {
                top: 30px;
                right: 30px;
            }
            
            .site-search-trigger.top-left {
                top: 30px;
                left: 30px;
            }

            .site-search-trigger:hover {
                background-color: var(--site-search-secondary-color);
                transform: scale(1.05);
            }

            /* Overlay */
            .site-search-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--site-search-overlay-color);
                z-index: 9999;
            }

            /* Modal */
            .site-search-modal {
                position: relative;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                background-color: var(--site-search-background-color);
                border-radius: 8px;
                box-shadow: 0 5px 15px var(--site-search-shadow-color);
                z-index: 10000;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            /* Header */
            .site-search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid var(--site-search-border-color);
            }

            .site-search-title {
                margin: 0;
                font-size: 18px;
                color: var(--site-search-text-color);
            }

            .site-search-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--site-search-text-color);
                opacity: 0.7;
                transition: var(--site-search-transition);
            }

            .site-search-close:hover {
                opacity: 1;
            }

            /* Search Form */
            .site-search-form {
                padding: 15px 20px;
                border-bottom: 1px solid var(--site-search-border-color);
            }

            .site-search-input {
                width: 100%;
                padding: 10px 15px;
                border: 1px solid var(--site-search-border-color);
                border-radius: 4px;
                font-size: 16px;
                outline: none;
                transition: var(--site-search-transition);
            }

            .site-search-input:focus {
                border-color: var(--site-search-accent-color);
                box-shadow: 0 0 0 2px rgba(74, 111, 165, 0.2);
            }

            /* Results */
            .site-search-results {
                padding: 0;
                overflow-y: auto;
                flex-grow: 1;
            }

            .site-search-result {
                padding: 15px 20px;
                border-bottom: 1px solid var(--site-search-border-color);
                cursor: pointer;
                transition: var(--site-search-transition);
            }

            .site-search-result:hover {
                background-color: var(--site-search-highlight-color);
            }

            .site-search-result-title {
                margin: 0 0 5px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--site-search-accent-color);
            }

            .site-search-result-content {
                margin: 0;
                font-size: 14px;
                color: var(--site-search-text-color);
                opacity: 0.8;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .site-search-result-meta {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 12px;
                color: var(--site-search-text-color);
                opacity: 0.6;
            }

            .site-search-highlight {
                background-color: rgba(74, 111, 165, 0.2);
                padding: 0 2px;
                border-radius: 2px;
            }

            /* Pagination */
            .site-search-pagination {
                display: flex;
                justify-content: center;
                padding: 15px 20px;
                border-top: 1px solid var(--site-search-border-color);
            }

            .site-search-pagination-button {
                background: none;
                border: 1px solid var(--site-search-border-color);
                border-radius: 4px;
                padding: 5px 10px;
                margin: 0 5px;
                cursor: pointer;
                transition: var(--site-search-transition);
            }

            .site-search-pagination-button:hover {
                background-color: var(--site-search-highlight-color);
            }

            .site-search-pagination-button.active {
                background-color: var(--site-search-accent-color);
                color: white;
                border-color: var(--site-search-accent-color);
            }

            /* Messages */
            .site-search-message {
                padding: 20px;
                text-align: center;
                color: var(--site-search-text-color);
                opacity: 0.7;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .site-search-modal {
                    width: 95%;
                    max-height: 70vh;
                }
                
                .site-search-trigger {
                    width: 45px;
                    height: 45px;
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSearchOpen()) {
                this.closeSearch();
            }
        });
    }
    
    /**
     * Open the search interface
     */
    openSearch() {
        this.searchContainer.style.display = 'flex';
        this.searchInput.focus();
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    /**
     * Close the search interface
     */
    closeSearch() {
        this.searchContainer.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    /**
     * Check if search is open
     */
    isSearchOpen() {
        return this.searchContainer && this.searchContainer.style.display === 'flex';
    }
    
    /**
     * Perform search based on input value
     */
    performSearch() {
        const term = this.searchInput.value.trim().toLowerCase();
        this.searchTerm = term;
        
        // Reset pagination
        this.currentPage = 1;
        
        // If term is empty, clear results
        if (!term) {
            this.searchResults = [];
            this.renderResults();
            return;
        }
        
        // If content is still loading, show loading message
        if (this.isLoading) {
            this.renderLoadingMessage();
            return;
        }
        
        // If there was an error loading content, show error message
        if (this.hasError) {
            this.renderErrorMessage();
            return;
        }
        
        // Filter content based on search term
        this.searchResults = this.siteContent.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(term);
            const contentMatch = item.content.toLowerCase().includes(term);
            return titleMatch || contentMatch;
        });
        
        // Trigger onSearch callback if provided
        if (typeof this.config.onSearch === 'function') {
            this.config.onSearch(term, this.searchResults);
        }
        
        // Render results
        this.renderResults();
    }
    
    /**
     * Render search results
     */
    renderResults() {
        // Clear results container
        this.resultsContainer.innerHTML = '';
        
        // If no results, show message
        if (this.searchResults.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'site-search-message';
            noResults.textContent = this.config.noResultsText;
            this.resultsContainer.appendChild(noResults);
            
            // Clear pagination
            this.paginationContainer.innerHTML = '';
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(this.searchResults.length / this.config.resultsPerPage);
        const startIndex = (this.currentPage - 1) * this.config.resultsPerPage;
        const endIndex = Math.min(startIndex + this.config.resultsPerPage, this.searchResults.length);
        
        // Get current page results
        const pageResults = this.searchResults.slice(startIndex, endIndex);
        
        // Render each result
        pageResults.forEach(result => {
            const resultElement = this.createResultElement(result);
            this.resultsContainer.appendChild(resultElement);
        });
        
        // Render pagination
        this.renderPagination(totalPages);
    }
    
    /**
     * Create a result element
     */
    createResultElement(result) {
        const resultElement = document.createElement('div');
        resultElement.className = 'site-search-result';
        resultElement.addEventListener('click', () => {
            // Trigger onResultClick callback if provided
            if (typeof this.config.onResultClick === 'function') {
                this.config.onResultClick(result);
            } else {
                // Default behavior: navigate to result URL
                window.location.href = result.url;
            }
            
            // Close search
            this.closeSearch();
        });
        
        // Title with highlighted search term
        const title = document.createElement('h4');
        title.className = 'site-search-result-title';
        title.innerHTML = this.highlightText(result.title, this.searchTerm);
        
        // Content snippet with highlighted search term
        const content = document.createElement('p');
        content.className = 'site-search-result-content';
        content.innerHTML = this.highlightText(this.getContentSnippet(result.content), this.searchTerm);
        
        // Meta information
        const meta = document.createElement('div');
        meta.className = 'site-search-result-meta';
        
        // Type
        const type = document.createElement('span');
        type.className = 'site-search-result-type';
        type.textContent = result.type || 'Page';
        
        // Date
        const date = document.createElement('span');
        date.className = 'site-search-result-date';
        date.textContent = result.date ? new Date(result.date).toLocaleDateString() : '';
        
        // Assemble meta
        meta.appendChild(type);
        if (result.date) {
            meta.appendChild(date);
        }
        
        // Assemble result
        resultElement.appendChild(title);
        resultElement.appendChild(content);
        resultElement.appendChild(meta);
        
        return resultElement;
    }
    
    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        // Clear pagination container
        this.paginationContainer.innerHTML = '';
        
        // If only one page, don't show pagination
        if (totalPages <= 1) {
            return;
        }
        
        // Previous button
        if (this.currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'site-search-pagination-button';
            prevButton.textContent = '←';
            prevButton.addEventListener('click', () => {
                this.currentPage--;
                this.renderResults();
            });
            this.paginationContainer.appendChild(prevButton);
        }
        
        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            // Show first, last, and pages around current page
            if (
                i === 1 ||
                i === totalPages ||
                (i >= this.currentPage - 1 && i <= this.currentPage + 1)
            ) {
                const pageButton = document.createElement('button');
                pageButton.className = `site-search-pagination-button ${i === this.currentPage ? 'active' : ''}`;
                pageButton.textContent = i;
                pageButton.addEventListener('click', () => {
                    this.currentPage = i;
                    this.renderResults();
                });
                this.paginationContainer.appendChild(pageButton);
            } else if (
                (i === this.currentPage - 2 && this.currentPage > 3) ||
                (i === this.currentPage + 2 && this.currentPage < totalPages - 2)
            ) {
                // Show ellipsis
                const ellipsis = document.createElement('span');
                ellipsis.className = 'site-search-pagination-ellipsis';
                ellipsis.textContent = '...';
                this.paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'site-search-pagination-button';
            nextButton.textContent = '→';
            nextButton.addEventListener('click', () => {
                this.currentPage++;
                this.renderResults();
            });
            this.paginationContainer.appendChild(nextButton);
        }
    }
    
    /**
     * Render loading message
     */
    renderLoadingMessage() {
        this.resultsContainer.innerHTML = '';
        const loading = document.createElement('div');
        loading.className = 'site-search-message';
        loading.textContent = this.config.loadingText;
        this.resultsContainer.appendChild(loading);
        
        // Clear pagination
        this.paginationContainer.innerHTML = '';
    }
    
    /**
     * Render error message
     */
    renderErrorMessage() {
        this.resultsContainer.innerHTML = '';
        const error = document.createElement('div');
        error.className = 'site-search-message';
        error.textContent = this.config.errorText;
        this.resultsContainer.appendChild(error);
        
        // Clear pagination
        this.paginationContainer.innerHTML = '';
    }
    
    /**
     * Get a snippet of content around the search term
     */
    getContentSnippet(content, maxLength = 150) {
        if (!content) return '';
        
        const term = this.searchTerm.toLowerCase();
        const lowerContent = content.toLowerCase();
        const termIndex = lowerContent.indexOf(term);
        
        // If term not found, return start of content
        if (termIndex === -1) {
            return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
        }
        
        // Calculate start and end indices for snippet
        let startIndex = Math.max(0, termIndex - 60);
        let endIndex = Math.min(content.length, termIndex + term.length + 60);
        
        // Adjust to not cut words
        if (startIndex > 0) {
            const prevSpace = content.lastIndexOf(' ', startIndex);
            startIndex = prevSpace !== -1 ? prevSpace + 1 : startIndex;
        }
        
        if (endIndex < content.length) {
            const nextSpace = content.indexOf(' ', endIndex);
            endIndex = nextSpace !== -1 ? nextSpace : endIndex;
        }
        
        // Create snippet
        let snippet = content.substring(startIndex, endIndex);
        
        // Add ellipsis if needed
        if (startIndex > 0) {
            snippet = '...' + snippet;
        }
        
        if (endIndex < content.length) {
            snippet = snippet + '...';
        }
        
        return snippet;
    }
    
    /**
     * Highlight search term in text
     */
    highlightText(text, term) {
        if (!term || !text) return text;
        
        const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="site-search-highlight">$1</span>');
    }
}

// Initialize from global config if available
if (typeof window !== 'undefined' && window.siteSearchConfig) {
    document.addEventListener('DOMContentLoaded', () => {
        new SiteSearch(window.siteSearchConfig);
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteSearch;
}
