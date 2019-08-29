
import React from 'react';
import PropTypes from 'prop-types';
import { HeadingText, Stack, StackItem, NerdGraphQuery, Spinner } from 'nr1';
const md5 = require('blueimp-md5');

/* BEGINHIDE */
import SOURCE from '!!raw-loader!./index.js';

var processSource = (source, query, path) => {
  return source
    .replace(/\{\/\*\ BEGINHIDE.*ENDHIDE \*\/\}/gs, "")
    .replace(/\/\*\ BEGINHIDE.*?ENDHIDE \*\//gs, "")
    .replace(/this\.props\.nerdletUrlState\.query/g, "\`"+query+"\`")
    .replace(/this\.props\.nerdletUrlState\.path/g, JSON.stringify(path))
}
/* ENDHIDE */

export default class User extends React.Component {
  static propTypes = {
    nerdletUrlState: PropTypes.object,
    launcherUrlState: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  getIn(node, path) {
    if (path.length == 0) return node
    let field = path.shift()
    return this.getIn(node[field], path)
  }

  render() {
    const query = this.props.nerdletUrlState.query
    const path = this.props.nerdletUrlState.path;

    return (
      <div style={{ padding: "42px", background: "white", height: "100%" }}>
        <Stack style={{height: "100%"}} alignmentType={Stack.ALIGNMENT_TYPE.FILL}>
          {/* BEGINHIDE */}
          <StackItem grow style={{borderRight: "1px solid #aaa"}}>
            <HeadingText type={HeadingText.TYPE.HEADING1}>Code</HeadingText>
            <textarea style={{fontFamily:"monospace", height:"100%", width:"100%"}}>
              {processSource(SOURCE, query, path)}
            </textarea>
          </StackItem>
          {/* ENDHIDE */}
          <StackItem grow style={{paddingLeft: "28px"}}>
          <HeadingText type={HeadingText.TYPE.HEADING1}>Hello World</HeadingText>
            <NerdGraphQuery query={query}>
              {({ loading, error, data }) => {
                if (loading) return <Spinner fillcontainer />
                if (error) return 'Error!';

                let userInfo = this.getIn(data, path)

                return <div>
                  <Stack>
                    <StackItem shrink>Name</StackItem>
                    <StackItem grow>{userInfo.name}</StackItem>
                  </Stack>

                  <Stack>
                    <StackItem shrink>Email</StackItem>
                    <StackItem grow>{userInfo.email}</StackItem>
                  </Stack>

                  {
                    userInfo.email ?
                    <Stack>
                      <StackItem shrink>Gravatar</StackItem>
                      <StackItem grow>
                        <img src={`https://www.gravatar.com/avatar/${md5(userInfo.email)}?s=60`} />
                      </StackItem>
                    </Stack>
                    : null
                  }

                </div>
              }}
            </NerdGraphQuery>
          </StackItem>
        </Stack>
      </div>
    );
  }
}
