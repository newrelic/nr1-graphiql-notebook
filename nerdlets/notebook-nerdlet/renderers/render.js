import React from 'react';

import EntityGuidRenderer from './entity-guid-renderer.js';
import EntityTagsRenderer from './entity-tags-renderer.js';
import EntityAlertSeverityRenderer from './entity-alert-severity-renderer.js';
import EpochMillisecondsRenderer from './epoch-milliseconds-renderer.js';
import NRQLRenderer from './nrql-renderer.js';

const RENDERERS = [
  EpochMillisecondsRenderer,
  EntityAlertSeverityRenderer,
  EntityTagsRenderer,
  NRQLRenderer,
  EntityGuidRenderer
];

// Crawls the augmented response tree and attaches custom rendered React
// components if a given node in the tree passes the component's test
export function renderTree(node, util) {
  if (!node || !node.__meta) return node;

  const CustomRenderer = RENDERERS.find(renderer => renderer.test(node));
  if (CustomRenderer) {
    return { __custom: <CustomRenderer node={node} util={util} />, ...node };
  } else if (node.__meta.leaf) {
    // Un-altered leaf nodes should simply collapse to their original value
    return node.value;
  } else {
    // Recurse on the rest of the tree
    return renderChildren(node, util);
  }
}

function renderChildren(node, util) {
  if (!node || !node.__meta) return node;
  if (node.__meta.list) {
    return node.value.map(listItem => renderTree(listItem, util));
  } else {
    Object.entries(node).forEach(([field, value]) => {
      node[field] = renderTree(value, util);
    });
    return node;
  }
}
