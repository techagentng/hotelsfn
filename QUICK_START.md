# Quick Start Guide

## ✅ Setup Complete!

Your React TypeScript + Tailwind + React Query + Framer Motion project is ready to use.

## 🚀 Start Development

```bash
npm run dev
```

Then visit:
- `http://localhost:3000` - Your main app
- `http://localhost:3000/example` - Full feature demo

## 📋 What's Configured

### 1. **React Query (TanStack Query)**
Global data fetching and state management configured in `pages/_app.tsx`.

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['myData'],
  queryFn: async () => {
    const res = await fetch('/api/endpoint');
    return res.json();
  },
});
```

### 2. **Theme System (Light/Dark Mode)**
CSS variables-based theming with localStorage persistence.

**Usage Example:**
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Toggle</button>;
}
```

**Available CSS Variables:**
```css
var(--bg-primary)      /* Background colors */
var(--bg-secondary)
var(--bg-tertiary)

var(--text-primary)    /* Text colors */
var(--text-secondary)
var(--text-tertiary)

var(--border-color)    /* Border color */

var(--accent-primary)  /* Accent colors */
var(--accent-success)
var(--accent-danger)
var(--accent-warning)
var(--accent-info)
```

### 3. **Framer Motion Animations**
Pre-built animation variants ready to use.

**Usage Example:**
```tsx
import AnimatedWrapper from '@/components/AnimatedWrapper';
import { fadeInUp } from '@/utils/animations';

<AnimatedWrapper variants={fadeInUp} delay={0.2}>
  <div>Animated content</div>
</AnimatedWrapper>
```

**Available Animations:**
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `scaleInCenter`
- `slideInLeft`, `slideInRight`, `slideInUp`, `slideInDown`
- `staggerContainer`, `staggerItem`
- `rotateIn`, `pageTransition`
- `modalOverlay`, `modalContent`

### 4. **Tailwind CSS v4**
Configured with PostCSS and custom utility classes.

**Pre-built Component Classes:**
```tsx
<div className="card">Card content</div>
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<input className="input" placeholder="Input field" />
```

## 🎨 Styling Approach

Use Tailwind utilities + CSS variables for theme-aware styling:

```tsx
// Good - Theme-aware with CSS variables
<div 
  className="p-4 rounded-lg"
  style={{ backgroundColor: 'var(--bg-secondary)' }}
>
  Content
</div>

// Also good - Use pre-built classes
<div className="card">
  Content
</div>
```

## 📁 Key Files

- `pages/_app.tsx` - App providers (React Query, Theme)
- `contexts/ThemeContext.tsx` - Theme management
- `utils/animations.ts` - Animation variants
- `components/AnimatedWrapper.tsx` - Reusable animation wrapper
- `components/ThemeToggle.tsx` - Theme switcher
- `styles/globals.css` - Global styles & CSS variables
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

## 🔧 Common Tasks

### Add a new page with animations
```tsx
import AnimatedWrapper from '@/components/AnimatedWrapper';
import { fadeInUp } from '@/utils/animations';

export default function MyPage() {
  return (
    <AnimatedWrapper variants={fadeInUp}>
      <h1>My Page</h1>
    </AnimatedWrapper>
  );
}
```

### Fetch data with React Query
```tsx
import { useQuery } from '@tanstack/react-query';

export default function DataPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### Create interactive button
```tsx
import { motion } from 'framer-motion';

<motion.button
  className="btn-primary"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

## 📖 Full Documentation

See `SETUP_GUIDE.md` for comprehensive documentation.

## 🐛 Troubleshooting

**CSS warnings in IDE?**
- Warnings about `@apply` are normal and don't affect functionality

**Theme not switching?**
- Make sure you're using CSS variables or the pre-built classes
- Check that ThemeProvider wraps your app in `_app.tsx`

**Animations not working?**
- Ensure component is wrapped in `motion.*` element
- Check that variants are imported from `@/utils/animations`

## 🎯 Next Steps

1. Visit `/example` to see everything in action
2. Start building your pages with the configured tools
3. Customize colors in `styles/globals.css` (CSS variables)
4. Add more animations in `utils/animations.ts`

Happy coding! 🚀
