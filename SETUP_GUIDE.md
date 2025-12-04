# React TypeScript Tailwind Setup Guide

This project is configured with React Query (TanStack Query), Tailwind CSS v4, and Framer Motion for animations.

## 🚀 Features

- **React Query (TanStack Query)**: Global state management and data fetching
- **Tailwind CSS v4**: Utility-first CSS framework with custom theming
- **Framer Motion**: Production-ready animation library
- **Dark Mode**: Built-in theme switching with persistence
- **TypeScript**: Full type safety

## 📦 Installed Packages

```json
{
  "@tanstack/react-query": "Latest",
  "@tanstack/react-query-devtools": "Latest",
  "framer-motion": "Latest",
  "@tailwindcss/postcss": "Latest"
}
```

## 🗂️ Project Structure

```
├── pages/
│   ├── _app.tsx              # App wrapper with providers
│   ├── example.tsx           # Example page showcasing features
│   └── ...
├── components/
│   ├── AnimatedWrapper.tsx   # Reusable animation wrapper
│   ├── ThemeToggle.tsx       # Theme switcher component
│   └── ...
├── contexts/
│   └── ThemeContext.tsx      # Theme provider and hook
├── utils/
│   └── animations.ts         # Framer Motion animation variants
└── styles/
    └── globals.css           # Global styles with theme variables
```

## 🎨 Theme System

### Using the Theme Hook

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Custom Theme Colors

The theme system includes predefined color palettes for both light and dark modes:

**Light Mode:**
- `light-bg-primary`, `light-bg-secondary`, `light-bg-tertiary`
- `light-text-primary`, `light-text-secondary`, `light-text-tertiary`
- `light-accent-primary`, `light-accent-success`, `light-accent-danger`, etc.

**Dark Mode:**
- `dark-bg-primary`, `dark-bg-secondary`, `dark-bg-tertiary`
- `dark-text-primary`, `dark-text-secondary`, `dark-text-tertiary`
- `dark-accent-primary`, `dark-accent-success`, `dark-accent-danger`, etc.

### Utility Classes

Pre-built component classes are available:

```tsx
// Cards
<div className="card">Content</div>

// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Inputs
<input className="input" placeholder="Enter text..." />
```

## 🎬 Animations with Framer Motion

### Available Animation Variants

Import from `@/utils/animations`:

- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `scaleInCenter`
- `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`
- `staggerContainer`, `staggerItem`
- `rotateIn`
- `pageTransition`
- `modalOverlay`, `modalContent`

### Using AnimatedWrapper

```tsx
import AnimatedWrapper from '@/components/AnimatedWrapper';
import { fadeInUp } from '@/utils/animations';

function MyComponent() {
  return (
    <AnimatedWrapper variants={fadeInUp} delay={0.2}>
      <div>This content will animate in</div>
    </AnimatedWrapper>
  );
}
```

### Direct Framer Motion Usage

```tsx
import { motion } from 'framer-motion';
import { fadeInLeft } from '@/utils/animations';

function MyComponent() {
  return (
    <motion.div
      variants={fadeInLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      Content
    </motion.div>
  );
}
```

### Interactive Animations

```tsx
import { motion } from 'framer-motion';

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
>
  Click me
</motion.button>
```

## 🔄 React Query Setup

### Basic Usage

```tsx
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### Mutations

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (newData) => {
      const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify(newData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myData'] });
    },
  });

  return (
    <button onClick={() => mutation.mutate({ name: 'New Item' })}>
      Add Item
    </button>
  );
}
```

### Global Configuration

React Query is configured in `pages/_app.tsx` with:
- 1-minute stale time
- No refetch on window focus
- 1 retry on failure

Modify these in `_app.tsx` as needed.

## 🎯 Example Page

Visit `/example` to see a comprehensive demo of all features:
- Theme switching
- React Query data fetching
- Various animation patterns
- Interactive elements
- Form inputs

## 🚀 Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## 📝 Notes

- The CSS warnings about `@apply` and `@import` in your IDE are expected and don't affect functionality
- Dark mode preference is saved to localStorage
- React Query DevTools are available in development mode (bottom-left corner)
- All animations are optimized for performance using Framer Motion's hardware acceleration

## 🎨 Customizing

### Adding New Theme Colors

Edit `tailwind.config.js` to add custom colors:

```js
theme: {
  extend: {
    colors: {
      light: {
        accent: {
          custom: '#yourcolor',
        }
      }
    }
  }
}
```

### Creating New Animations

Add to `utils/animations.ts`:

```ts
export const myCustomAnimation: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  },
};
```

## 🔧 Troubleshooting

**Build errors with Tailwind:**
- Ensure `@tailwindcss/postcss` is installed
- Check `postcss.config.js` uses `@tailwindcss/postcss`

**Theme not persisting:**
- Check browser localStorage is enabled
- Verify ThemeProvider wraps your app in `_app.tsx`

**Animations not working:**
- Ensure Framer Motion is imported correctly
- Check component is wrapped in motion element
