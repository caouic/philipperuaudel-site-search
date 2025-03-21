/**
 * PhilippeRuaudel-SiteSearch Integration Script
 * 
 * This script makes it easy to integrate SiteSearch into any website.
 * Simply include this script in the <head> of your site and configure
 * the options according to your needs.
 * 
 * @author Philippe Ruaudel
 * @license MIT
 * @version 1.0.0
 */

(function() {
    // Function to load an external JavaScript script
    function loadScript(url, callback) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    // Function to merge default options with user options
    function mergeOptions(defaultOptions, userOptions) {
        const result = {};
        for (const key in defaultOptions) {
            result[key] = defaultOptions[key];
        }
        for (const key in userOptions) {
            result[key] = userOptions[key];
        }
        return result;
    }

    // Default options
    const defaultOptions = {
        // Appearance
        showSearchButton: true,
        searchButtonPosition: 'bottom-right',
        searchButtonColor: '#4a6fa5',
        accentColor: '#4cb5ae',
        secondaryColor: '#166088',
        
        // Data source
        dataSource: 'test', // Possible values: 'test', 'json', 'api'
        dataEndpoint: null,
        apiKey: null,
        
        // Test data (used if dataSource = 'test')
        testData: [
            {
                id: 1,
                title: "Home Page",
                content: "Welcome to our website. We offer a variety of services and products to meet your needs.",
                url: "/index.html",
                type: "pages",
                date: "2025-01-15"
            },
            {
                id: 2,
                title: "About Us",
                content: "Our team is composed of dedicated experts providing innovative solutions for your business.",
                url: "/about.html",
                type: "pages",
                date: "2025-01-10"
            },
            {
                id: 3,
                title: "Services",
                content: "Discover our professional services tailored to your specific needs.",
                url: "/services.html",
                type: "pages",
                date: "2025-01-20"
            }
        ]
    };

    // Get user options
    const userOptions = window.siteSearchOptions || {};
    
    // Merge options
    const options = mergeOptions(defaultOptions, userOptions);
    
    // Configure SiteSearch based on options
    window.siteSearchConfig = {
        // Appearance options
        showSearchButton: options.showSearchButton,
        searchButtonPosition: options.searchButtonPosition,
        searchButtonColor: options.searchButtonColor,
        accentColor: options.accentColor,
        secondaryColor: options.secondaryColor,
        searchButtonSelector: options.searchButtonSelector,
        
        // Search settings
        resultsPerPage: options.resultsPerPage || 5,
        searchPlaceholder: options.searchPlaceholder || 'What are you looking for?',
        popupTitle: options.popupTitle || 'Search',
        
        // Customization
        noResultsText: options.noResultsText || 'No results found',
        searchButtonText: options.searchButtonText || '🔍',
        loadingText: options.loadingText || 'Loading...',
        errorText: options.errorText || 'Error loading content',
        
        // Callbacks
        onSearch: options.onSearch || null,
        onResultClick: options.onResultClick || null
    };
    
    // Configure data source
    switch (options.dataSource) {
        case 'test':
            // Use test data
            window.siteSearchConfig.siteContent = options.testData;
            break;
            
        case 'json':
            // Use a local JSON file
            if (options.dataEndpoint) {
                window.siteSearchConfig.dataEndpoint = options.dataEndpoint;
            } else {
                console.error('SiteSearch: dataEndpoint is required for "json" data source');
            }
            break;
            
        case 'api':
            // Use an API
            if (options.dataEndpoint) {
                window.siteSearchConfig.dataEndpoint = options.dataEndpoint;
                
                // Add API key if provided
                if (options.apiKey) {
                    window.siteSearchConfig.apiKey = options.apiKey;
                }
                
                // Add resource ID if provided
                if (options.resourceId) {
                    window.siteSearchConfig.resourceId = options.resourceId;
                }
            } else {
                console.error('SiteSearch: dataEndpoint is required for "api" data source');
            }
            break;
            
        default:
            console.error('SiteSearch: unrecognized data source');
    }
    
    // Load the SiteSearch script
    const siteSearchScriptUrl = options.scriptUrl || 'site-search.js';
    loadScript(siteSearchScriptUrl, function() {
        console.log('SiteSearch loaded successfully');
    });
})();
