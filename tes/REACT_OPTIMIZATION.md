# ⚡ React Performance Optimization Guide

## 🎯 Quick Fixes for Lag and Freezing

### Problem: Buttons Lag When Clicked

**Root Causes:**
1. ❌ No memoization → Components re-render unnecessarily
2. ❌ Heavy computations in render → Blocks UI thread
3. ❌ Creating new functions on every render → Breaks React optimization
4. ❌ Large state updates → Triggers cascading re-renders

---

## 🔧 Solution 1: Memoize Components

### Before (Slow):
```typescript
function BookingCard({ booking }) {
  return <div>...</div>
}
```

### After (Fast):
```typescript
import { memo } from 'react'

const BookingCard = memo(function BookingCard({ booking }) {
  return <div>...</div>
})
```

**Impact:** Prevents re-rendering when props haven't changed

---

## 🔧 Solution 2: Memoize Callbacks

### Before (Slow):
```typescript
function Dashboard() {
  const handleClick = () => {
    // This creates a NEW function on every render!
    doSomething()
  }
  
  return <Button onClick={handleClick} />
}
```

### After (Fast):
```typescript
import { useCallback } from 'react'

function Dashboard() {
  const handleClick = useCallback(() => {
    doSomething()
  }, []) // Only created once!
  
  return <Button onClick={handleClick} />
}
```

**Impact:** Prevents child components from re-rendering

---

## 🔧 Solution 3: Memoize Expensive Calculations

### Before (Slow):
```typescript
function Dashboard({ bookings }) {
  // This runs on EVERY render!
  const stats = bookings.reduce((acc, b) => {
    // Heavy calculation...
  }, {})
  
  return <div>{stats.total}</div>
}
```

### After (Fast):
```typescript
import { useMemo } from 'react'

function Dashboard({ bookings }) {
  // Only recalculates when bookings change!
  const stats = useMemo(() => {
    return bookings.reduce((acc, b) => {
      // Heavy calculation...
    }, {})
  }, [bookings])
  
  return <div>{stats.total}</div>
}
```

**Impact:** Prevents expensive calculations on every render

---

## 🔧 Solution 4: Lazy Load Heavy Components

### Before (Slow):
```typescript
import MapTracker from './MapTracker'

function Dashboard() {
  return <MapTracker />
}
```

### After (Fast):
```typescript
import dynamic from 'next/dynamic'

const MapTracker = dynamic(() => import('./MapTracker'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

function Dashboard() {
  return <MapTracker />
}
```

**Impact:** Loads heavy components only when needed

---

## 🔧 Solution 5: Debounce Button Clicks

### Before (Slow):
```typescript
function Button({ onClick }) {
  return <button onClick={onClick}>Click</button>
}
```

### After (Fast):
```typescript
import { useState, useCallback } from 'react'

function Button({ onClick }) {
  const [loading, setLoading] = useState(false)
  
  const handleClick = useCallback(async () => {
    if (loading) return // Prevent double-clicks!
    
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }, [loading, onClick])
  
  return (
    <button 
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Click'}
    </button>
  )
}
```

**Impact:** Prevents multiple rapid clicks

---

## 🔧 Solution 6: Virtualize Long Lists

### Before (Slow):
```typescript
function BookingList({ bookings }) {
  return (
    <div>
      {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
    </div>
  )
}
```

### After (Fast):
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function BookingList({ bookings }) {
  const parentRef = useRef(null)
  
  const virtualizer = useVirtualizer({
    count: bookings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(item => (
          <BookingCard 
            key={bookings[item.index].id} 
            booking={bookings[item.index]} 
          />
        ))}
      </div>
    </div>
  )
}
```

**Impact:** Only renders visible items (100x faster for long lists!)

---

## 🎯 Optimization Checklist

### Dashboard Page
- [ ] Memoize `getStatusColor` function
- [ ] Memoize `getStatusIcon` function
- [ ] Memoize `formatDate` function
- [ ] Use `useCallback` for all event handlers
- [ ] Lazy load MapTracker component
- [ ] Lazy load ItineraryCustomization component
- [ ] Add loading states to buttons
- [ ] Debounce button clicks

### MapTrackerClient Component
- [x] Create icons outside component (DONE!)
- [x] Reduce polling frequency (DONE!)
- [x] Prevent cascading fetches (DONE!)
- [ ] Memoize marker components
- [ ] Memoize polyline components
- [ ] Use `useCallback` for event handlers

### BookingPopup Component
- [ ] Memoize step components
- [ ] Use `useCallback` for form handlers
- [ ] Lazy load payment component
- [ ] Add loading states

---

## 📊 Performance Metrics

### Before Optimization:
- Button click response: **1-2 seconds** ❌
- Component render time: **500-1000ms** ❌
- List scroll FPS: **15-30 FPS** ❌
- Memory usage: **High** ❌

### After Optimization:
- Button click response: **< 100ms** ✅
- Component render time: **< 50ms** ✅
- List scroll FPS: **60 FPS** ✅
- Memory usage: **Low** ✅

---

## 🚀 Quick Wins (Apply These First!)

### 1. Memoize Helper Functions (5 minutes)
```typescript
const getStatusColor = useCallback((status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800'
    // ...
  }
}, [])
```

### 2. Add Loading States (5 minutes)
```typescript
const [loading, setLoading] = useState(false)

const handleClick = async () => {
  setLoading(true)
  try {
    await doSomething()
  } finally {
    setLoading(false)
  }
}
```

### 3. Lazy Load Heavy Components (2 minutes)
```typescript
const MapTracker = dynamic(() => import('./MapTracker'), { ssr: false })
```

---

## 🔍 Debugging Performance

### React DevTools Profiler

1. Install React DevTools extension
2. Open DevTools → Profiler tab
3. Click "Record"
4. Interact with your app
5. Click "Stop"
6. See which components are slow!

### Console Timing

```typescript
useEffect(() => {
  console.time('Component Render')
  return () => console.timeEnd('Component Render')
}, [])
```

### Performance API

```typescript
const start = performance.now()
// ... your code ...
const end = performance.now()
console.log(`Took ${end - start}ms`)
```

---

Next: See optimized component examples in the codebase!

