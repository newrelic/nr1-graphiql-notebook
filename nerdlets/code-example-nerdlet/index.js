
import React from 'react';
import PropTypes from 'prop-types';
import { navigation, Button, Icon, HeadingText, Stack, StackItem, NerdGraphQuery, Spinner } from 'nr1';



export default class CodeExampleNerdlet extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  getIn = (node, path) => {
    if (path.length == 0) return node

    let field = path[0]
    let rest = path.slice(1)
    return this.getIn(node[field], rest)
  }

  renderSeverity = (severity) => {
    if (!severity) return null;
    let color = {
      CRITICAL: "#BF0016",
      NOT_ALERTING: "#11A600",
      NOT_CONFIGURED: "#8E9494",
      WARNING: "#FFD966"
    }[severity]

    return <span color={color} style={{color: color}}>&#11044;</span>
  }

  flatMap = (list, fn) => {
    return list.reduce((result, element) => {
      return result.concat(fn(element) || [])
    }, [])
  }

  renderEntityTags = (entityTags) => {
    if (!entityTags) return null
    let expandedList = this.flatMap(entityTags, (tag) => {
      return tag.values.map((tagValue) => {
        return {key: tag.key, value: tagValue}
      })
    })
    return expandedList.map(this.renderTag)
  }

  renderTag = ({key, value}) => {
    let tagStyle = {display: "inline-block", border: "1px solid #aaa", padding:"4px", margin:"4px"}
    return <div key={`${key}-${value}`} style={tagStyle}>
      <b>{key}</b>={value}
    </div>
  }

  render() {
    const query = `{
  actor {
    user {
      email
      id
      name
    }
    entity(guid: "MTAwMTM5MjB8QVBNfEFQUExJQ0FUSU9OfDY4NTY5Nzk") {
      accountId
      domain
      guid
      name
      reporting
      tags {
        key
        values
      }
      type
      entityType
      ... on AlertableEntity {
        alertSeverity
      }
    }
  }
}
`
    const path = ["actor","entity"];

    return (
      <div style={{ padding: "42px", background: "white", height: "100%" }}>
        <Stack style={{ height: "100%" }} alignmentType={Stack.ALIGNMENT_TYPE.FILL}>

          <StackItem grow style={{ paddingLeft: "28px" }}>
            <NerdGraphQuery query={query}>
              {({ loading, error, data }) => {
                if (loading) return <Spinner fillcontainer />
                if (error) return 'Error!';

                let entityInfo = this.getIn(data, path)
                return <div>
                  <HeadingText style={{marginBottom: "28px"}}>
                  {this.renderSeverity(entityInfo.alertSeverity)}&nbsp;
                  {entityInfo.name || "No Name Selected"}
                  </HeadingText>

                  <Stack gapType={Stack.GAP_TYPE.LOOSE} style={{marginBottom: "14px"}}>
                    <StackItem style={{minWidth:"75px"}}><b>Account Id</b></StackItem>
                    <StackItem>
                      { entityInfo.accountId }&nbsp;
                      { entityInfo.accountId ?
                          <a target="_blank" href={`https://staging.newrelic.com/accounts/${entityInfo.accountId}`}>
                            Visit Account Page
                          </a>
                          :
                          null
                      }
                    </StackItem>
                  </Stack>

                  <Stack gapType={Stack.GAP_TYPE.LOOSE} style={{marginBottom: "14px"}}>
                    <StackItem style={{minWidth:"75px"}}><b>Reporting?</b></StackItem>
                    <StackItem>
                      {entityInfo.reporting ?
                        <Icon
                          sizeType={Icon.SIZE_TYPE.MEDIUM}
                          type={Icon.TYPE.INTERFACE__SIGN__CHECKMARK__V_ALTERNATE} />
                        :
                        <Icon
                          sizeType={Icon.SIZE_TYPE.MEDIUM}
                          type={Icon.TYPE.INTERFACE__SIGN__EXCLAMATION__V_ALTERNATE} />
                      }
                    </StackItem>
                  </Stack>

                  <Stack gapType={Stack.GAP_TYPE.LOOSE} style={{marginBottom: "14px"}}>
                    <StackItem style={{minWidth:"75px"}}><b>GUID</b></StackItem>
                    <StackItem>
                      { entityInfo.guid ?
                        <>
                          <Button
                            type={Button.TYPE.PRIMARY}
                            sizeType={Button.SIZE_TYPE.SLIM}
                            iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER__S_OK}
                            onClick={() => {
                              navigation.openStackedNerdlet({
                                id: 'slicer-dicer.apm-overview',
                                urlState: { entityId: entityInfo.guid }
                              });
                            }}>
                            Visit Entity
                          </Button>
                          <br/>
                          <span>{entityInfo.guid}</span>
                        </>
                        :
                        null
                      }
                    </StackItem>
                  </Stack>

                  <Stack gapType={Stack.GAP_TYPE.LOOSE} style={{marginBottom: "14px"}}>
                    <StackItem style={{minWidth:"75px"}}><b>Tags</b></StackItem>
                    <StackItem style={{maxWidth: "200px"}}>
                      {this.renderEntityTags(entityInfo.tags)}
                    </StackItem>
                  </Stack>
                </div>
              }}
            </NerdGraphQuery>
          </StackItem>
        </Stack>
      </div>
    );
  }
}
