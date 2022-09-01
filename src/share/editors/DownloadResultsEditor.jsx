import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import css from '../../../css/module/share-insight.css';
import flex from '../../../css/module/flex.css';
import buttons from '../../../css/module/buttons.css';
import { datasourceUrlPrefix, userAction } from '../../../util';

class DownloadResultsEditor extends Component {
  render() {
    const { viewToShare, rowRequestId, exportsDisabled, feedsDisabled } =
      this.props;

    const randomSeed = Math.round(Math.random() * 1000) + 1;
    const downloadPrefix = viewToShare
      ? `${viewToShare.downloadPrefix()}1d/${viewToShare.downloadSuffix()}.csv`
      : `${datasourceUrlPrefix()}/rows/${rowRequestId}/download`;
    const downloadPath = `${downloadPrefix}?origin=download&seed=${randomSeed}`;

    const onDownload = () => {
      userAction('use-download');
      window.open(downloadPath, '_blank');
    };

    const disabled =
      (!viewToShare && !rowRequestId) || exportsDisabled || feedsDisabled;

    const button = (
      <button
        onClick={onDownload}
        className={`${buttons.btn} ${buttons.lg} ${buttons.dark} ${buttons.rounded}`}
        disabled={disabled}
      >
        <FontAwesomeIcon
          icon="cloud-download-alt"
          style={{ marginRight: '8px' }}
        />
        <span>Download</span>
      </button>
    );

    return (
      <div className={`${css.shareSection} margin-top-30`}>
        <div className={css.shareOption}>
          <h5>
            Download <small>(CSV for Excel)</small>
          </h5>
          {!disabled ? (
            button
          ) : (
            <span className={flex.flex}>
              <span data-tip data-for="downloadButton">
                {button}
              </span>
              <ReactTooltip id="downloadButton" effect="solid" place="bottom">
                <span>
                  {exportsDisabled || feedsDisabled
                    ? 'Disabled by admin'
                    : 'Query still running'}
                </span>
              </ReactTooltip>
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default DownloadResultsEditor;
