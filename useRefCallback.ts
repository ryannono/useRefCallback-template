// External libraries
import { useCallback, useRef } from 'react';

// Types
import {
  MultiNode,
  MultiNodeRefCallback,
  RefCallbackEffect,
  SingleNode,
  SingleNodeRefCallback,
} from './utils/types';

/**
 * Provides a ref callback function for DOM elements, facilitating the
 * attachment and detachment effects with optional cleanup. This hook
 * operates in two modes based on the generic type parameter: `SingleNode`
 * and `MultiNode`.
 *
 * - `SingleNode` (Default): Designed for a singular node. When the node
 *   gets detached, its associated cleanup (if any) is run. When used in
 *   this mode, the returned ref callback only expects the node.
 *
 * - `MultiNode`: Intended for scenarios where the ref callback might be
 *   used with multiple nodes dynamically. Each node should be passed with
 *   its own unique ID to manage the associated cleanup functions.
 *
 * @template NodeT - The DOM element type, extending HTMLElement.
 * @template ModeT - Determines the behavior of the ref callback. It can
 *        be `SingleNode` (default) or `MultiNode`.
 *
 * @param {RefCallbackEffect<NodeT>} effect - The effect function invoked
 *        when the ref is attached to a node. It can optionally return a
 *        cleanup function to run on node detachment or when dependencies
 *        change.
 *
 * @param {React.DependencyList} deps - Array of dependencies. Changes in
 *        these will cause the effect (and potential cleanup) to re-invoked.
 *
 * @returns Depending on the mode (Type `ModeT`), the hook returns either
 *          a SingleNodeRefCallback or MultiNodeRefCallback.
 */
export function useRefCallback<
  NodeT extends HTMLElement,
  ModeT extends MultiNode | SingleNode = SingleNode,
>(
  effect: RefCallbackEffect<NodeT>,
  deps: React.DependencyList
): ModeT extends MultiNode
  ? MultiNodeRefCallback<NodeT>
  : SingleNodeRefCallback<NodeT> {
  // A map to keep track of cleanup functions for both single and multi-node attachments
  const cleanupsMap = useRef(new Map<string, VoidFunction>());

  // Default to 'single' for singleNode and expect nodeId for multiNode
  return useCallback(
    (node: NodeT | null, nodeId = 'single') => {
      if (node) {
        const cleanupCallback = effect(node);
        if (typeof cleanupCallback === 'function') {
          cleanupsMap.current.set(nodeId, cleanupCallback);
        }
      } else {
        const currNodeCleanup = cleanupsMap.current.get(nodeId);
        if (currNodeCleanup) {
          currNodeCleanup();
          cleanupsMap.current.delete(nodeId);
        }
      }
    },
    [effect, ...deps]
  );
}
