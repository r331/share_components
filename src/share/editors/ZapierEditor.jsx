import React, { Component } from 'react';
import { get } from '../../../util';
import css from '../../../css/module/share-insight.css';
import { CopyBox } from '../../CopyBox';
import ZapierTemplates from '../../ZapierTemplates';

class ZapierEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zapierAPIKey: 'loading...',
    };
  }

  componentDidMount() {
    get('loading Zapier API Key', '/alerts/zapier/api-key')
      .then((json) => {
        this.setState({
          zapierAPIKey: json.key,
        });
      })
      .catch((e) => window.console.error('problem loading zapier API key', e));
  }

  showZaps(isDisabled) {
    const zaps = this.props.shareOption
      .zaps()
      .filter((z) => z.disabled() === isDisabled);
    const activeClass = !isDisabled ? css.zapierActive : '';
    const display = zaps.map((z, i) => {
      const trigger = z.showChanged() ? 'new or changed rows' : 'new rows';
      const frequency = z.frequency();
      const author = z.recipients()[0];
      return (
        <div key={i} className="no-wrap">
          <a target="_blank" href="https://zapier.com/app/zaps">
            <span className={`${css.tag} ${activeClass}`}>
              Trigger: {trigger}
            </span>
          </a>
          <a target="_blank" href="https://zapier.com/app/zaps">
            <span className={`${css.tag} ${activeClass}`}>
              Frequency: {frequency}
            </span>
          </a>
          <a target="_blank" href="https://zapier.com/app/zaps">
            <span className={`${css.tag} ${activeClass}`}>
              API Key: {author}
            </span>
          </a>
        </div>
      );
    });
    return display;
  }

  render() {
    const { shareOption } = this.props;

    const countActiveZaps = shareOption
      .zaps()
      .filter((z) => z.disabled() === false).length;
    const countInactiveZaps = shareOption.zaps().length - countActiveZaps;

    return (
      <div className={css.shareSection}>
        <div className={css.shareOption}>
          <h5>
            Zaps
            <small>
              {' '}
              (Create and manage your zaps via{' '}
              <a target="_blank" href="https://zapier.com/app/zaps">
                <b>your Zapier dashboard</b>
              </a>
              )
            </small>
          </h5>
          <p>
            There {countActiveZaps === 1 ? 'is' : 'are'}{' '}
            <b>
              {countActiveZaps} active {countActiveZaps === 1 ? 'zap' : 'zaps'}
            </b>
          </p>
        </div>
        {countActiveZaps === 0 ? null : (
          <div className={css.shareOption}>{this.showZaps(false)}</div>
        )}
        {countInactiveZaps === 0 ? null : (
          <div>
            <div className={css.shareOption}>
              <p>
                There {countInactiveZaps === 1 ? 'is' : 'are'}{' '}
                <b>
                  {countInactiveZaps} inactive{' '}
                  {countInactiveZaps === 1 ? 'zap' : 'zaps'}
                </b>
              </p>
            </div>
            <div className={css.shareOption}>{this.showZaps(true)}</div>
          </div>
        )}
        <div className={css.shareOption}>
          <hr />
        </div>
        <div className={css.shareOption}>
          <ZapierTemplates />
        </div>
        <div className={css.shareOption}>
          <hr />
        </div>
        {/* <div className={css.shareOption}>
					<h5>Manage your zaps</h5>
					<p>Create and manage your zaps via <a target='_blank' href="https://zapier.com/app/zaps"><b>your Zapier dashboard</b></a>.</p>
				</div> */}
        <div className={css.shareOption}>
          <h5>Your Zapier API Key</h5>
          <p>
            You'll need this when creating new zaps. It's your personal key -
            please don't share it.
          </p>
          <CopyBox
            className={`${css.inputWidth300} margin-top-20`}
            value={this.state.zapierAPIKey}
          />
        </div>
      </div>
    );
  }
}

export default ZapierEditor;
