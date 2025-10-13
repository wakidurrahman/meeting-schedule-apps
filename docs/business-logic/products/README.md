# Products Page Implementation with AG Grid React

## Overview

This implementation adds a Products page to the meeting scheduler application that displays product data from the [DummyJSON API](https://dummyjson.com/products) using AG Grid React. The data is fetched through GraphQL but originates from an external API rather than MongoDB.

## Key Features

✅ **AG Grid React Integration**

- Professional data grid with enterprise features
- Sortable, filterable, and resizable columns
- Client-side pagination support
- Responsive table design

✅ **External API Integration**

- Data fetched from DummyJSON API (https://dummyjson.com)
- Server-side GraphQL layer for consistent API pattern
- No MongoDB involvement - purely external data source

✅ **Full-Stack Implementation**

- Server-side GraphQL resolvers and type definitions
- Client-side GraphQL queries and TypeScript types
- Reusable AG Grid table component
- Integrated routing and navigation

## Architecture

### Data Flow

```
DummyJSON API → Server GraphQL Resolver → Client GraphQL Query → AG Grid Table
```

1. **External API**: DummyJSON provides product data
2. **Server Layer**: GraphQL resolver fetches from DummyJSON
3. **Client Layer**: Apollo Client queries GraphQL endpoint
4. **UI Layer**: AG Grid displays data with advanced features

## File Structure

### Server Files

```
server/
├── graphql/
│   ├── type-defs/
│   │   ├── product.js          # Product GraphQL schema
│   │   └── index.js            # Updated to include products
│   └── resolvers/
│       ├── product.js          # Product resolvers with DummyJSON API
│       └── index.js            # Updated to include products
└── constants/
    └── messages.js             # Added product error messages
```

### Client Files

```
client/
├── src/
│   ├── components/
│   │   ├── molecules/
│   │   │   └── AgGridTable.tsx         # Reusable AG Grid component
│   │   └── atoms/
│   │       └── page-spinner/
│   │           └── index.tsx           # Added ProductsPageSpinner
│   ├── pages/
│   │   └── products/
│   │       └── index.tsx               # Products page
│   ├── graphql/
│   │   └── product/
│   │       └── queries.ts              # Product GraphQL queries
│   ├── types/
│   │   └── product.ts                  # Product TypeScript types
│   ├── constants/
│   │   └── paths.ts                    # Added /products route
│   └── routes/
│       └── index.tsx                   # Added Products route
```

## Implementation Details

### 1. Server-Side GraphQL

#### Type Definitions (`server/graphql/type-defs/product.js`)

```graphql
type Product {
  id: ID!
  title: String!
  description: String!
  category: String!
  price: Float!
  discountPercentage: Float!
  rating: Float!
  stock: Int!
  # ... more fields
}

type ProductsResult {
  products: [Product!]!
  total: Int!
  skip: Int!
  limit: Int!
}

extend type Query {
  products(input: ProductsQueryInput): ProductsResult!
  product(id: ID!): Product
  searchProducts(query: String!, limit: Int, skip: Int): ProductsResult!
  productsByCategory(category: String!, limit: Int, skip: Int): ProductsResult!
}
```

#### Resolvers (`server/graphql/resolvers/product.js`)

- **Independent from MongoDB**: Uses `fetch()` to call DummyJSON API
- **Error Handling**: Proper GraphQL error handling with custom error codes
- **Pagination Support**: Implements limit/skip pagination
- **Multiple Query Types**: All products, single product, search, and category filtering

### 2. Client-Side Implementation

#### AG Grid Table Component (`client/src/components/molecules/AgGridTable.tsx`)

**Features:**

- Generic TypeScript component `<T>`
- Configurable pagination, sorting, filtering
- Customizable themes (Alpine, Balham, Material)
- Flexible column definitions
- Loading states

**Usage Example:**

```tsx
<AgGridTable<Product>
  columnDefs={columnDefs}
  rowData={products}
  pagination={false}
  height="600px"
  theme="alpine"
/>
```

#### Products Page (`client/src/pages/products/index.tsx`)

**Features:**

- Apollo Client for GraphQL queries
- Custom column definitions with formatters
- Image rendering in grid cells
- Conditional cell styling (low stock warning)
- Manual pagination controls
- Loading and error states
- Refresh functionality

**Column Features:**

- Product images with thumbnail rendering
- Price formatting with currency symbol
- Rating display with star emoji
- Stock level warnings (red for low stock)
- Category and availability status

### 3. GraphQL Integration

#### Client Queries (`client/src/graphql/product/queries.ts`)

```typescript
// Get all products with pagination
GET_PRODUCTS;

// Get single product by ID
GET_PRODUCT;

// Search products
SEARCH_PRODUCTS;

// Get products by category
GET_PRODUCTS_BY_CATEGORY;
```

All queries are typed with TypedDocumentNode for full TypeScript support.

### 4. TypeScript Types

**Product Types** (`client/src/types/product.ts`):

- `Product` - Full product type
- `ProductDimensions` - Product dimensions
- `ProductReview` - Customer review
- `ProductMeta` - Metadata
- `ProductsResult` - Query result with pagination

## API Endpoints

### DummyJSON API Endpoints Used

1. **Get All Products**: `GET https://dummyjson.com/products?limit=30&skip=0`
2. **Get Single Product**: `GET https://dummyjson.com/products/{id}`
3. **Search Products**: `GET https://dummyjson.com/products/search?q={query}`
4. **Get by Category**: `GET https://dummyjson.com/products/category/{category}`

## Navigation & Routes

### Route Configuration

- **Path**: `/products`
- **Protected**: Yes (requires authentication)
- **Role**: USER (all authenticated users)
- **Lazy Loaded**: Yes
- **Spinner**: ProductsPageSpinner

### Navigation Menu

Products link is added to main navigation:

- Label: "Products"
- Visible to: All authenticated users (USER role)
- Position: After Bookings in nav menu

## AG Grid Configuration

### Default Features

- ✅ Sortable columns
- ✅ Filterable columns (text, number, set filters)
- ✅ Resizable columns
- ✅ Row selection (multiple)
- ✅ Cell text selection
- ✅ Animated rows
- ✅ Loading overlay

### Custom Styling

- Theme: Alpine (default AG Grid theme)
- Height: 600px
- Width: 100% (responsive)
- Custom cell renderers for images
- Conditional styling for stock levels

## Dependencies

### New Packages Installed

```json
{
  "ag-grid-react": "^34.2.0",
  "ag-grid-community": "^34.2.0"
}
```

### AG Grid Styles Imported

```tsx
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
```

## Data Source Notes

### Important Considerations

1. **No Database Storage**: Products are NOT stored in MongoDB
2. **External API Dependency**: Relies on DummyJSON API availability
3. **Read-Only**: No mutations implemented (products are from external source)
4. **Pagination**: Server-side pagination via query parameters
5. **Caching**: Apollo Client caches responses for better performance

### DummyJSON API Limitations

- 194 total products available
- Categories: beauty, fragrances, furniture, groceries
- Free to use, no API key required
- May have rate limiting (not documented)

## Testing & Verification

### Manual Testing Steps

1. **Navigate to Products Page**

   ```
   Login → Click "Products" in navigation
   ```

2. **Verify Grid Features**

   - Sort by clicking column headers
   - Filter using column filter menus
   - Resize columns by dragging borders
   - Navigate pages using Previous/Next buttons

3. **Check Data Display**

   - Product images should load
   - Prices should show with $ symbol
   - Low stock items (≤10) should show in red
   - Rating should display with star emoji

4. **Test Refresh**
   - Click "Refresh" button
   - Grid should reload data from API

## Future Enhancements

### Potential Improvements

1. **Search Functionality**

   - Add search bar to filter products
   - Implement debounced search

2. **Category Filter**

   - Dropdown to filter by category
   - Use productsByCategory query

3. **Product Detail Page**

   - Click row to view full product details
   - Show reviews and images

4. **Export Features**

   - Export to CSV/Excel
   - Print functionality

5. **Advanced Filtering**

   - Price range slider
   - Rating filter
   - Stock status filter

6. **Performance**
   - Virtual scrolling for large datasets
   - Image lazy loading
   - Server-side sorting/filtering

## Troubleshooting

### Common Issues

1. **AG Grid Styles Not Loading**

   - Ensure CSS imports are in the component
   - Check build process includes CSS

2. **TypeScript Errors**

   - AG Grid types may need `@ts-expect-error` comment
   - Ensure ag-grid-community types are installed

3. **API Errors**

   - Check DummyJSON API is accessible
   - Verify network connectivity
   - Check browser console for CORS issues

4. **No Data Displayed**
   - Check GraphQL resolver is running
   - Verify Apollo Client configuration
   - Check browser DevTools Network tab

## References

- [AG Grid React Documentation](https://www.ag-grid.com/react-data-grid/)
- [DummyJSON API Docs](https://dummyjson.com/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

---

## Quick Start Commands

```bash
# Client side (if packages need reinstalling)
cd client
npm install ag-grid-react ag-grid-community

# Start development server (from root)
# Server: npm run dev (in server directory)
# Client: npm run dev (in client directory)
```

## Summary

This implementation successfully:

- ✅ Adds AG Grid React to the project
- ✅ Creates a reusable AgGridTable molecule component
- ✅ Implements independent GraphQL layer for external API
- ✅ Fetches data from DummyJSON API (not MongoDB)
- ✅ Provides full-stack type safety with TypeScript
- ✅ Follows existing project patterns and conventions
- ✅ Includes proper error handling and loading states
- ✅ Adds navigation and routing integration
