import React from 'react';

export default class EpochMillisecondsRenderer extends React.Component {
  static test(node) {
    return node.__meta.typename == 'EpochMilliseconds' && node.value != null;
  }

  render() {
    let dateTime = new Date(this.props.node.value);
    return (
      <span className="json-tree-date-field">
        {dateTime.toLocaleDateString() +
          ' ' +
          dateTime.toLocaleTimeString() +
          ' UTC'}
      </span>
    );
  }
}
