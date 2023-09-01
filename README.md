# `useRefCallback` Hook

React's `useRefCallback` hook bridges the gap between referencing DOM nodes and handling their associated side-effects, especially when the nodes dynamically attach or detach.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Concept](#concept)
  * [Modes](#modes)
- [Usage](#usage)
  * [SingleNode Example: Dynamic Positioning Based on Reference Element](#singlenode-example-dynamic-positioning-based-on-reference-element)
  * [MultiNode Example: Dynamic Video Observer](#multinode-example-dynamic-video-observer)
- [Practical Example: `ToolTip` Component](#practical-example-tooltip-component)
- [Conclusion](#conclusion)

## Overview

In React, managing references and their side-effects can be tricky, especially when DOM nodes dynamically attach or detach. The `useRefCallback` hook is designed to bridge this gap, providing a clean and optimized way to handle node attachments with optional cleanup processes.

Traditional use of refs often involves combining them with the `useEffect` hook. However, this approach can become cumbersome and might not address all edge cases. The `useRefCallback` hook offers a more intuitive method, preventing excessive renders and unneeded side-effects.

This hook operates in two modes: `SingleNode` and `MultiNode`, catering to a variety of scenarios. This README walks you through the conceptual understanding and provides practical examples to get you started.

## Installation

First, make sure you've installed the necessary dependencies:

```bash
npm install react
```

Next, clone or download this repository.

## Concept

Traditional React development involves using a `ref` to interact with a DOM element. When this ref is used with side-effects that need to trigger upon the node's attachment or detachment, the process can get convoluted. The `useRefCallback` offers a seamless way to merge these operations.

### Modes

1. **SingleNode**: This is the standard mode designed for a single node. Upon detachment, its corresponding cleanup (if defined) executes.
2. **MultiNode**: Tailored for scenarios where you might use the ref callback with various nodes dynamically. Each node should come with a unique ID to manage its specific cleanup functions.

## Usage

### SingleNode Example: Dynamic Positioning Based on Reference Element

This example demonstrates how to use `useRefCallback` to position children elements dynamically around a reference element based on its size.

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

Observe multiple video elements on a page. Videos play when fully in view and pause otherwise.

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

## Practical Example: `ToolTip` Component

A versatile `ToolTip` that can be used almost anywhere. The component handles all it's events based on the parent without ever needing to pass down props.

import { useRef, HTMLAttributes } from 'react';
import { motion, useAnimation } from 'framer-motion';
import useViewportSize from '../../features/viewportSize/hook/useViewportSize';
import { useRefCallback } from '../../hooks/useRefCallback/useRefCallback';

export default function ToolTip({ children, className, ...rest }: ToolTipProps) {
  const controls = useAnimation();
  const { desktop } = useViewportSize();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const attachedElements = useRef(new Set<HTMLElement>());

  const containerRef = useRefCallback((node) => {
    const hoverElement = node.parentElement;
    if (desktop) {
      hoverElement?.addEventListener('mouseenter', () => controls.start());
      hoverElement?.addEventListener('mouseleave', () => controls.stop());
    } else {
      hoverElement?.addEventListener('click', () => controls.toggle());
    }

    return () => {
      hoverElement?.removeEventListener('mouseenter', () => controls.start());
      hoverElement?.removeEventListener('mouseleave', () => controls.stop());
      hoverElement?.removeEventListener('click', () => controls.toggle());
    };
  }, [controls, desktop]);

  return (
    <figcaption className={`tooltipContainer ${className ?? ''}`} ref={containerRef} {...rest}>
      <motion.div ref={tooltipRef} animate={controls}>
        {children}
      </motion.div>
    </figcaption>
  );
}

type ToolTipProps = {
  children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>;


## Conclusion

The `useRefCallback` hook offers a more streamlined and modular approach to managing DOM nodes and their associated side-effects in React. Whether dealing with a single node or dynamically handling multiple ones, this hook can help simplify your codebase and boost performance by eliminating the need for re-renders.
