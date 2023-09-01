/**
 * The effect that's applied to the node when using a ref callback.
 * It receives a node of type T and can optionally return a cleanup function of type RefCallbackCleanup.
 *
 * @template T - Type of the DOM node.
 */
export type RefCallbackEffect<T> = (node: T) => VoidFunction | void;

/**
 * Configuration options for when the attachment is meant for a single node.
 */
export type SingleNode = 'singleNode';

/**
 * Configuration options for when the attachment is designed for multiple nodes.
 */
export type MultiNode = 'multiNode';

/**
 * A callback type designed for multi-node attachment scenarios.
 * It provides an additional nodeID to uniquely identify nodes in a multi-node environment.
 *
 * @template T - Type of the DOM node.
 */
export type MultiNodeRefCallback<T> = (node: T | null, nodeID: string) => void;

/**
 * A callback type specifically tailored for single node attachment.
 *
 * @template T - Type of the DOM node.
 */
export type SingleNodeRefCallback<T> = (node: T | null) => void;

/**
 * A general ref callback that can either be for single node or multi-node scenarios.
 *
 * @template T - Type of the DOM node.
 */
export type RefCallback<T> = SingleNodeRefCallback<T> | MultiNodeRefCallback<T>;
