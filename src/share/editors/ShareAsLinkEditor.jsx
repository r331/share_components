import React, { Component } from 'react';
import css from '../../../css/module/share-insight.css';
import flex from '../../../css/module/flex.css';
import { CopyBox } from '../../CopyBox';
import { rootDomain, fetchJson } from '../../../util';

class ShareAsLinkEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: 'loading...',
      password: '',
    };
  }

  componentDidMount() {
    const { viewToShare } = this.props;
    if (viewToShare) {
      fetchJson(`/view/${this.props.viewToShare.id()}/meta`).then((json) => {
        this.setState({
          url: `${rootDomain()}/share/view/${json._shareableSeries}/load.html`,
          password: json._shareablePassword,
          loading: false,
        });
      });
    }
  }

  render() {
    const { viewToShare, rowRequestId } = this.props;

    const path = viewToShare
      ? `/share/v/${viewToShare.series()}`
      : `/share/r/${rowRequestId}`;

    const disabled = !(viewToShare || rowRequestId);

    const fade = viewToShare ? {} : { opacity: 0.3 };

    return (
      <div className={`${css.shareSection} margin-top-30`}>
        <div className={css.shareOption}>
          <h5>
            Share with team{' '}
            <small>(only logged-in users can access this)</small>
          </h5>
          <CopyBox
            className={`${css.inputWidth300} margin-top-20`}
            value={
              viewToShare || !disabled
                ? rootDomain() + path
                : 'Query still running...'
            }
            disabled={disabled}
          >
            <button
              className="btn btn-primary save-btns"
              type="button"
              onClick={() => window.open(rootDomain() + path, '_blank')}
              disabled={disabled}
            >
              Open
            </button>
          </CopyBox>
          <p />
        </div>

        <div className={css.shareOption}>
          <hr />
          <br />
          <div className={`${flex.row} ${flex.alignItemsStart}`}>
            <h5 style={fade} className="margin-right-10">
              Share with PIN{' '}
              <small>(anyone with the link and pin can access this)</small>
            </h5>
            {viewToShare ? null : (
              <span className={`${css.tag} ${css.saveTag}`}>save first</span>
            )}
          </div>
          <div style={fade}>
            <p>
              Your PIN is {viewToShare ? <b>{this.state.password}</b> : '...'}
            </p>
            <CopyBox
              className={`${css.inputWidth300} margin-top-20`}
              value={viewToShare ? this.state.url : '...'}
              disabled={!viewToShare}
            >
              <button
                className="btn btn-primary save-btns"
                type="button"
                onClick={() => window.open(this.state.url, '_blank')}
                disabled={!viewToShare}
              >
                Open
              </button>
            </CopyBox>
          </div>
        </div>
      </div>
    );
  }
}

export default ShareAsLinkEditor;
