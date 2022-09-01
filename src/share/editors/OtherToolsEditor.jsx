import React, { Component } from 'react';
import css from '../../../css/module/share-insight.css';
import { CopyBox } from '../../CopyBox';
import { fetchJson } from '../../../util';
import ShareOptionOtherTools from '../options/ShareOptionOtherTools';

class OtherToolsEditor extends Component {
  componentDidMount() {
    const { shareOption, viewToShare, onUpdateOption } = this.props;

    // Live Feeds if off, so check every few seconds whether it has been turned on
    if (!shareOption.isOn()) {
      this.interval = setInterval(() => {
        fetchJson(`/views/${viewToShare.id()}`)
          .then((json) => {
            if (json._isOtherShareable) {
              // make 'active'
              onUpdateOption(new ShareOptionOtherTools(true));
              clearInterval(this.interval);
            }
          })
          .catch((e) => {
            window.console.error('problem loading view data', e);
            clearInterval(this.interval);
          });
      }, 2000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { viewToShare } = this.props;

    const URL = viewToShare.downloadPrefix() + viewToShare.downloadSuffix();

    return (
      <div className={css.shareSection}>
        <div className={css.shareOption}>
          <h5>Send as CSV</h5>
          <p>
            Live-stream results to PowerBI, Geckoboard, Google Data Studio and
            other tools that accept live CSVs (results update hourly)
          </p>
          <CopyBox
            className={`${css.inputWidth300} margin-top-20`}
            value={`${URL}.csv`}
          >
            {/* <button className="btn btn-primary save-btns" type="button" onClick={e => window.open(URL+'.csv', '_blank')}>Download</button> */}
          </CopyBox>
        </div>
        <div className={css.shareOption}>
          <h5>Send as JSON</h5>
          <CopyBox
            className={`${css.inputWidth300} margin-top-20`}
            value={`${URL}.json`}
          >
            {/* <button className="btn btn-primary save-btns" type="button" onClick={e => window.open(URL+'.json', '_blank')}>Download</button> */}
          </CopyBox>
        </div>
        <div className={css.shareOption}>
          <h5>
            Download as pivot table <small>(requires 3 columns)</small>
          </h5>
          <p>
            This option extracts the values in the 2nd column, adds them as
            headers, and populates the table with the values in the 3rd column.
          </p>
          <CopyBox
            className={`${css.inputWidth300} margin-top-20`}
            value={`${viewToShare.downloadPrefix()}2d/${viewToShare.downloadSuffix()}.csv`}
          >
            <button
              className="btn btn-primary save-btns"
              type="button"
              onClick={() =>
                window.open(
                  `${viewToShare.downloadPrefix()}2d/${viewToShare.downloadSuffix()}.csv`,
                  '_blank',
                )
              }
            >
              Download
            </button>
          </CopyBox>
        </div>
      </div>
    );
  }
}

export default OtherToolsEditor;
