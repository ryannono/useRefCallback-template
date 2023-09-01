# useRefCallback Hook

## Overview

In React, managing references and their side-effects can be tricky, especially when DOM nodes dynamically attach or detach. The `useRefCallback` hook is designed to bridge this gap, providing a clean and optimized way to handle node attachments with optional cleanup processes.

Traditional use of refs often involves combining them with the `useEffect` hook. However, this approach can become cumbersome and might not address all edge cases. The `useRefCallback` hook offers a more intuitive method, preventing excessive renders and unneeded side-effects.

This hook operates in two modes: `SingleNode` and `MultiNode`, catering to a variety of scenarios. This README walks you through the conceptual understanding and provides practical examples to get you started.

## Installation

To begin using the `useRefCallback` hook, first ensure you have the necessary dependencies installed:

```bash
npm install react
```

Then, clone or download this repository.

## Concept

When a component needs to interact with a DOM element, the traditional method involves attaching a `ref` to it. This `ref` might also need side effects when the node gets attached or detached. The `useRefCallback` eases this by combining the process of attaching a ref and handling the side-effects in a streamlined manner.

### Modes

1. **SingleNode**: This is the default mode tailored for a singular node. When the node gets detached, its associated cleanup (if any) is run.

2. **MultiNode**: Intended for scenarios where the ref callback might be used with multiple nodes dynamically. Each node should be passed with its unique ID to manage the associated cleanup functions.

## Basic Usage

### SingleNode Example: Dynamic Positioning Based on Reference Element

Imagine you have a layout component that positions children in a circle around a reference element. The exact position depends on the size of the reference element.

**CircleLayoutProvider.tsx**:

```tsx
import React, { createContext, ReactNode } from 'react';
import { useRefCallback } from './useRefCallback'; // Adjust the path accordingly

type CircleLayoutContextType = {
  registerChild: (node: HTMLElement) => void;
};

const CircleLayoutContext = createContext<CircleLayoutContextType | undefined>(undefined);

export function CircleLayoutProvider({ children }: { children: ReactNode }) {
  const registerChild = useRefCallback<HTMLDivElement>(
    (node) => {
      // Compute the position based on the reference element's size
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.sqrt(node.clientWidth * node.clientHeight) / 2;
      
      node.style.position = 'absolute';
      node.style.left = `${centerX + distance * Math.cos(angle) - node.clientWidth / 2}px`;
      node.style.top = `${centerY + distance * Math.sin(angle) - node.clientHeight / 2}px`;
    }
  );

  return (
    <CircleLayoutContext.Provider value={{ registerChild }}>
      {children}
    </CircleLayoutContext.Provider>
  );
}

export function useCircleLayout() {
  const context = React.useContext(CircleLayoutContext);
  if (!context) {
    throw new Error("useCircleLayout must be used within a CircleLayoutProvider");
  }
  return context;
}
```

**CircleChild.tsx**:

```tsx
import React from 'react';
import { useCircleLayout } from './CircleLayoutProvider'; // Adjust the path accordingly

function CircleChild() {
  const { registerChild } = useCircleLayout();

  return (
    <div ref={registerChild} style={{ width: '50px', height: '50px', backgroundColor: 'red' }}>
      I'm a child
    </div>
  );
}
```

**App.tsx**:

```tsx
import React from 'react';
import CircleLayoutProvider from './CircleLayoutProvider'; // Adjust the path accordingly
import CircleChild from './CircleChild'; // Adjust the path accordingly

function App() {
  return (
    <CircleLayoutProvider>
      <CircleChild />
      <CircleChild />
      <CircleChild />
    </CircleLayoutProvider>
  );
}

export default App;
```

In this example, each child is dynamically positioned in a circular arrangement around the center of the screen. The distance from the center depends on the child's size. This showcases how `useRefCallback` allows for dynamic DOM measurements and operations based on an element's properties, which wouldn't be feasible with a regular event handler.

### MultiNode Example: Dynamic Video Observer

Using the `useDynamicVideos` hook, you can observe multiple video elements on a page. The hook will play a video when it's fully in view and pause it when it's not.

```tsx
// ... (imports)

export default function useDynamicVideos() {
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const setDynamicVideo = useRefCallback<HTMLVideoElement, MultiNode>(
    (node) => {
      if (!intersectionObserverRef.current) {
        intersectionObserverRef.current = getDynamicVideoObserver();
      }
      intersectionObserverRef.current.observe(node);

      return () => intersectionObserverRef.current?.unobserve(node);
    },
    []
  );

  return setDynamicVideo;
}

// Usage
const setDynamicVideo = useDynamicVideos();

return (
  <video
    ref={(node) => setDynamicVideo(node, uid())}
    className="parsedVideo"
    src="video.mp4"
  />
);
```

## Conclusion

The `useRefCallback` hook offers a cleaner, more modular approach to managing DOM nodes and their associated side-effects. Whether you're dealing with a single node or dynamically working with multiple nodes, this hook can simplify your codebase and enhance performance.
