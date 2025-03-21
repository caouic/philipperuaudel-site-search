# PhilippeRuaudel-SiteSearch

A lightweight, customizable search solution for websites.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

PhilippeRuaudel-SiteSearch is a JavaScript library that adds powerful search functionality to any website. It's designed to be easy to integrate, highly customizable, and works with various data sources.

**Key Features:**
- 🔍 Add search functionality to any website with minimal setup
- 🎨 Fully customizable appearance to match your website's design
- 📱 Responsive design that works on all devices
- 🔌 Multiple data source options (test data, JSON files, APIs)
- 🚀 Lightweight with no external dependencies
- 🌐 Works with various API providers (Kernex, custom APIs, headless CMS)

## Quick Start

### Basic Integration

Add the following code to the `<head>` section of your HTML:

```html
<!-- SiteSearch Integration -->
<script>
    window.siteSearchOptions = {
        // Appearance
        showSearchButton: true,
        searchButtonPosition: 'bottom-right',
        searchButtonColor: '#4a6fa5',
        
        // Data source - choose one of the following:
        
        // Option 1: Use test data
        dataSource: 'test'
        
        // Option 2: Use a local JSON file
        // dataSource: 'json',
        // dataEndpoint: 'path/to/your-data.json'
        
        // Option 3: Use an API
        // dataSource: 'api',
        // dataEndpoint: 'https://api.example.com/search-content',
        // apiKey: 'your-api-key'
    };
</script>
<script src="site-search-integration.js"></script>
```

### Installation Options

#### Option 1: Download Files

1. Download the following files:
   - `site-search.js` - The main library
   - `site-search-integration.js` - The integration script

2. Add them to your project directory

3. Include the integration script in your HTML as shown above

#### Option 2: CDN (Coming Soon)

```html
<script src="https://cdn.jsdelivr.net/gh/philipperuaudel/site-search@latest/site-search-integration.js"></script>
```

## Configuration Options

### Appearance Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| showSearchButton | boolean | true | Show/hide the floating search button |
| searchButtonPosition | string | 'bottom-right' | Position of the search button ('bottom-right', 'bottom-left', 'top-right', 'top-left') |
| searchButtonColor | string | '#4a6fa5' | Background color of the search button |
| accentColor | string | '#4cb5ae' | Primary accent color for the search interface |
| secondaryColor | string | '#166088' | Secondary color for hover states and highlights |
| searchButtonSelector | string | null | CSS selector for a custom search button |

### Data Source Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| dataSource | string | 'test' | Source of search data ('test', 'json', 'api') |
| dataEndpoint | string | null | URL for JSON file or API endpoint |
| apiKey | string | null | API key for authentication |
| resourceId | string | null | Resource ID for API (if needed) |
| testData | array | [...] | Custom test data (when dataSource is 'test') |

### Search Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| resultsPerPage | number | 5 | Number of results per page |
| searchPlaceholder | string | 'What are you looking for?' | Placeholder text for search input |
| popupTitle | string | 'Search' | Title of the search popup |
| noResultsText | string | 'No results found' | Text shown when no results are found |
| loadingText | string | 'Loading...' | Text shown while loading content |
| errorText | string | 'Error loading content' | Text shown when an error occurs |
| searchButtonText | string | '🔍' | Text/icon for the search button |

### Callbacks

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| onSearch | function | null | Called when a search is performed |
| onResultClick | function | null | Called when a search result is clicked |

## Data Formats

### JSON File Format

When using a local JSON file as the data source, the file should contain an array of objects with the following properties:

```json
[
  {
    "id": "1",
    "title": "Article Title",
    "content": "Article content goes here...",
    "url": "/article.html",
    "type": "article",
    "date": "2025-03-01"
  },
  ...
]
```

### API Response Format

SiteSearch supports various API response formats:

#### Standard Format (Recommended)

```json
{
  "data": [
    {
      "id": "1",
      "title": "Article Title",
      "content": "Article content goes here...",
      "url": "/article.html",
      "type": "article",
      "date": "2025-03-01"
    },
    ...
  ]
}
```

#### Alternative Formats

SiteSearch will try to automatically detect the structure of your API response. It supports:

1. Direct array of items
2. Data encapsulated in a `data` property
3. Data in another array property (first array property found)

## Using with Different API Providers

### Kernex API

```javascript
window.siteSearchOptions = {
    dataSource: 'api',
    dataEndpoint: 'https://api.kernex.io/api/v1/your-project-id/resource/your-resource/:resourceId',
    apiKey: 'your-kernex-api-key',
    resourceId: 'your-resource-id'
};
```

### Custom REST API

```javascript
window.siteSearchOptions = {
    dataSource: 'api',
    dataEndpoint: 'https://your-domain.com/api/search-content',
    apiKey: 'your-api-key'
};
```

### Headless CMS (e.g., Contentful, Strapi)

```javascript
window.siteSearchOptions = {
    dataSource: 'api',
    dataEndpoint: 'https://cdn.contentful.com/spaces/your-space-id/environments/master/entries',
    apiKey: 'your-contentful-access-token'
};
```

## Advanced Usage

### Using a Custom Button

You can use your own button to trigger the search:

```html
<!-- Your custom button -->
<button id="my-search-button">Search</button>

<script>
    window.siteSearchOptions = {
        showSearchButton: false, // Hide the default button
        searchButtonSelector: '#my-search-button', // Use your custom button
        dataSource: 'test'
    };
</script>
<script src="site-search-integration.js"></script>
```

### Custom Event Handlers

```javascript
window.siteSearchOptions = {
    dataSource: 'test',
    
    // Called when a search is performed
    onSearch: function(term, results) {
        console.log('Search performed:', term);
        console.log('Results found:', results.length);
        
        // You can implement custom analytics here
        if (window.gtag) {
            gtag('event', 'search', {
                'search_term': term,
                'results_count': results.length
            });
        }
    },
    
    // Called when a search result is clicked
    onResultClick: function(result) {
        console.log('Result clicked:', result);
        
        // You can implement custom navigation or other actions here
        // For example, show a modal instead of navigating to the URL
        if (result.type === 'modal') {
            showModal(result.id);
            return false; // Prevent default navigation
        }
        
        // Default behavior: navigate to result URL
        window.location.href = result.url;
    }
};
```

### Custom Test Data

```javascript
window.siteSearchOptions = {
    dataSource: 'test',
    testData: [
        {
            id: "custom-1",
            title: "Custom Article 1",
            content: "This is a custom article for testing purposes.",
            url: "/custom-1.html",
            type: "article",
            date: "2025-03-01"
        },
        {
            id: "custom-2",
            title: "Custom Article 2",
            content: "Another custom article for testing purposes.",
            url: "/custom-2.html",
            type: "article",
            date: "2025-03-02"
        }
    ]
};
```

## Browser Support

PhilippeRuaudel-SiteSearch supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Development

### Project Structure

```
philipperuaudel-site-search/
├── site-search.js             # Main library
├── site-search-integration.js # Integration script
├── sample-data.json           # Sample JSON data
├── sample-api-response.json   # Sample API response
├── demo-test-data.html        # Demo using test data
├── demo-local-json.html       # Demo using local JSON
├── demo-api.html              # Demo using API
├── demo-custom.html           # Demo with custom config
├── index.html                 # Project homepage
└── README.md                  # Documentation
```

### Building from Source

The project is plain JavaScript with no build step required.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Created by [Philippe Ruaudel](https://github.com/philipperuaudel)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
