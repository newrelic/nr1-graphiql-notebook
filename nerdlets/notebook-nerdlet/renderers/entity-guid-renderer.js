import React from 'react';
import PropTypes from 'prop-types';

import { navigation, Button } from 'nr1';

export default class EntityGuidRenderer extends React.Component {
  static test(node) {
    return node.__meta.typename === 'EntityGuid';
  }

  static propTypes = {
    node: PropTypes.shape({
      value: PropTypes.string
    }),
    util: PropTypes.shape({
      addCell: PropTypes.func
    })
  };

  render() {
    const entityGuid = this.props.node.value;

    const { addCell } = this.props.util;
    const suggestedQuery = `
{
  actor {
    entity(guid: "${entityGuid}") {
      name
      accountId
      guid
      domain
      entityType
      reporting
      ... on AlertableEntity {
        alertSeverity
      }
    }
  }
}
`;
    return (
      <div className="json-tree-text-field json-tree-value-widget">
        &nbsp; "{entityGuid}"
        <br />
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={
            Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER__S_OK
          }
          onClick={() => {
            navigation.openStackedNerdlet({
              id: 'slicer-dicer.apm-overview',
              urlState: { entityId: entityGuid }
            });
          }}
        >
          Visit Entity
        </Button>
        <Button
          type={Button.TYPE.PLAIN_NEUTRAL}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
          onClick={() => {
            addCell({
              query: suggestedQuery,
              notes:
                "The 'entity' field allows you to access more information about an entity than a simple entity search."
            });
          }}
        >
          Query NerdGraph for more details
        </Button>
      </div>
    );
  }
}
