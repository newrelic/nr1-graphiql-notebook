class CodeSampleModal extends React.PureComponent {
  constructor() {
      super(...arguments);

      this._onClose = this._onClose.bind(this);

      this.state = {
          hidden: true,
      };
  }

  _onClose() {
      this.setState({ hidden: true });
  }

  render() {
      return (
          <>
              <Button onClick={() => this.setState({ hidden: false })}>
                  Open Modal
              </Button>

              <Modal hidden={this.state.hidden} onClose={this._onClose}>
                  <HeadingText type='heading1'>Modal</HeadingText>
                  <BlockText type={BlockText.TYPE.PARAGRAPH}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore
                      magna aliqua. Dictumst quisque sagittis purus sit amet.
                      Dui ut ornare lectus sit amet. Pulvinar elementum
                      integer enim neque. Lacus vel facilisis volutpat est
                      velit egestas. Tincidunt praesent semper feugiat nibh
                      sed. Dignissim enim sit amet venenatis urna cursus eget
                      nunc. Turpis egestas maecenas pharetra convallis posuere
                      morbi leo. Quis viverra nibh cras pulvinar mattis.
                      Consectetur adipiscing elit duis tristique. Velit
                      dignissim sodales ut eu.
                  </BlockText>
                  <Button onClick={this._onClose}>Close</Button>
              </Modal>
          </>
      );
  }
}
