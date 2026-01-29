# macOS Liquid Glass Design System

## Overview

This design system implements authentic macOS design principles including Liquid Glass, Vibrancy, and fluid animations.

## Design Principles

### 1. Liquid Glass
- Dynamic transparency with backdrop blur
- Light refraction effects
- Depth through layering
- Subtle gradients

### 2. Vibrancy
- Background colors bleeding through UI
- Context-aware transparency
- Adaptive contrast

### 3. Fluid Motion
- 60 FPS animations
- Spring physics
- Genie-like transitions
- Micro-interactions

## Color System

### Base Colors
```css
--bg-primary: #0a0a0a;      /* Deep black */
--bg-secondary: #1a1a1a;    /* Elevated black */
--bg-tertiary: #2a2a2a;     /* Card backgrounds */
```

### Text Colors
```css
--text-primary: #ffffff;    /* Primary text */
--text-secondary: #a0a0a0;  /* Secondary text */
--text-tertiary: #606060;   /* Tertiary text */
```

### Accent Colors
```css
--accent-blue: #3B82F6;     /* Primary actions */
--accent-purple: #8B5CF6;   /* Secondary actions */
--accent-green: #10B981;    /* Success states */
--accent-red: #EF4444;      /* Error states */
```

## Components

### Button

#### Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

#### With Icon
```tsx
<Button icon={<FiPlus />}>Add Document</Button>
```

#### Loading State
```tsx
<Button loading>Processing...</Button>
```

### Card

```tsx
<Card>
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>

<Card hover padding="lg">
  Hoverable card with large padding
</Card>
```

### Input

```tsx
<Input 
  label="Email"
  type="email"
  placeholder="you@example.com"
  icon={<FiMail />}
/>

<Input 
  label="Password"
  type="password"
  error="Password is required"
/>
```

### Modal

```tsx
<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content...</p>
</Modal>
```

### Toast

```tsx
import { toast } from './components/Toast';

toast.success('Document uploaded!');
toast.error('Failed to save');
toast.info('Processing...');
toast.warning('Storage almost full');
```

## Utility Classes

### Liquid Glass Effect
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Glow Effect
```css
.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.glow-purple {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
             'Segoe UI', sans-serif;
```

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)

### Font Weights
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Spacing

Based on 4px grid:
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **12**: 3rem (48px)
- **16**: 4rem (64px)

## Border Radius

- **sm**: 0.5rem (8px)
- **md**: 0.75rem (12px)
- **lg**: 1rem (16px)
- **xl**: 1.5rem (24px)
- **2xl**: 2rem (32px)
- **full**: 9999px

## Animations

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Scale
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Stagger Children
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Usage
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

## Accessibility

### Focus States
All interactive elements have visible focus states:
```css
focus:outline-none focus:ring-2 focus:ring-accent-blue/50
```

### Color Contrast
- Text on backgrounds meets WCAG AA standards
- Minimum contrast ratio: 4.5:1

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order
- Escape key closes modals

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images

## Best Practices

1. **Use semantic HTML** - `<button>`, `<nav>`, `<main>`, etc.
2. **Maintain hierarchy** - Proper heading levels (h1-h6)
3. **Consistent spacing** - Use the 4px grid system
4. **Smooth animations** - 60 FPS, use GPU-accelerated properties
5. **Mobile-first** - Design for mobile, enhance for desktop
6. **Dark mode optimized** - All components designed for dark backgrounds

---

**Last Updated**: January 2026
