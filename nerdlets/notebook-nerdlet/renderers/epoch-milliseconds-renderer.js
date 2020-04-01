import React from 'react';
import PropTypes from 'prop-types';

export default class EpochMillisecondsRenderer extends React.Component {
  static test(node) {
    return node.__meta.typename === 'EpochMilliseconds' && node.value != null;
  }

  static propTypes = {
    node: PropTypes.object
  };

  render() {
    const dateTime = new Date(this.props.node.value);
    return (
      <span className="json-tree-date-field">
        {`${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString()} UTC`}
      </span>
    );
  }
}
