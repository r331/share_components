import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import css from '../../../css/module/share-insight.css';
import buttons from '../../../css/module/buttons.css';
import {
  datasourceId,
  fetchJson,
  openBlankWindow,
  userAction,
} from '../../../util';
import { CopyBox } from '../../CopyBox';
import ShareOptionGoogleSheets from '../options/ShareOptionGoogleSheets';
import Tip, { INFO } from '../../Tip';

class GoogleSheetsEditor extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { shareOption, viewToShare, onUpdateOption } = this.props;

    userAction('open-sheets-editor');

    // Google sheets if off, so check every few seconds whether it has been turned on
    if (!shareOption.isOn()) {
      this.interval = setInterval(() => {
        fetchJson(`/views/${viewToShare.id()}`)
          .then((json) => {
            if (json._isSheetsShareable) {
              // turn on Google sheets
              onUpdateOption(new ShareOptionGoogleSheets(true));
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

    const randomSeed = Math.round(Math.random() * 100) + 1;

    const advancedContent = (
      <div>
        <div className={css.shareOption}>
          <h5>Need to manually refresh the results?</h5>
          <p>
            At the end of the import URL, there is a parameter called{' '}
            <em>seed=</em> followed by a number.
          </p>
          <p>
            <b>E.g. seed=84</b>
          </p>
          <p>
            To refresh the results inbetween automatic refreshes, simply change
            this seed number.
          </p>
        </div>
        <div className={css.shareOption}>
          <h5>Dates displaying as numbers?</h5>
          <p>
            If Google Sheets displays your date values as numbers (e.g.
            43962.42), just highlight the column in Google Sheets, then select{' '}
            <b>Format</b> (from the top menu) &gt; <b>Number</b> &gt;{' '}
            <b>Date</b>.
          </p>
        </div>
        <div className={css.shareOption}>
          <h5>Exceeded Google's import limit?</h5>
          <p>
            Google Sheets limits the number of rows you can import at a time.
          </p>
          <p>
            If you hit this limit, you'll see an error along the lines of
            "Resource at url contents exceeded maximum size"
          </p>
          <p>
            You can use the following method to <em>split</em> your results into
            groups of 10,000 rows (you can try a higher or lower number):
          </p>
          <ol>
            <li>
              <p>
                <b>Bring in the first 10,000 rows</b>
              </p>
              <p>
                On row 1, paste the link below, which contains the following URL
                parameter: <span className={css.tag}>&maxRows=10000</span>
              </p>
              <CopyBox
                className={`${css.inputWidth300} margin-top-20`}
                value={
                  `=importdata("${viewToShare.downloadPrefix()}1d/${viewToShare.downloadSuffix()}.csv?seed=${randomSeed}&maxRows=10000` +
                  `")`
                }
              />
            </li>
            <li className="margin-top-10">
              <p>
                <b>Bring in the next 10,000 rows</b>
              </p>
              <p>
                On row 10,001, paste the link below, which contains an
                additional parameter that will cause it to skip the 10,000 rows
                already imported:{' '}
                <span className={css.tag}>rowsOffset=10000&maxRows=10000</span>
              </p>
              <CopyBox
                className={`${css.inputWidth300} margin-top-20`}
                value={
                  `=importdata("${viewToShare.downloadPrefix()}1d/${viewToShare.downloadSuffix()}.csv?seed=${randomSeed}&rowsOffset=10000&maxRows=10000` +
                  `")`
                }
              />
            </li>
          </ol>
        </div>
        <div className={css.shareOption}>
          <h5>Have a question?</h5>
          <p>
            We can help!{' '}
            <a
              href="#"
              className="no-wrap"
              onClick={(e) => {
                e.preventDefault();
                Intercom('show');
              }}
            >
              Click here
            </a>{' '}
            to chat with us.
          </p>
        </div>
      </div>
    );

    const clickGoogleSheets = () => {
      openBlankWindow('http://sheets.new');
      userAction('click-new-google-sheet');
    };

    return (
      <div className={`${css.shareSection} margin-top-30`}>
        <div className={css.shareOption}>
          <h5>Paste this link into any cell in Google Sheets</h5>
          <p>
            Google will import the latest results around once an hour,
            automatically.
          </p>
          <CopyBox
            onClick={() => this.props.notifyParent()}
            className={`${css.inputWidth300} margin-top-20`}
            value={`=importdata("${viewToShare.downloadPrefix()}1d/${viewToShare.downloadSuffix()}.csv?seed=${randomSeed}${
              datasourceId() === '65f7d267-abeb-4f2f-86a6-544d56518746'
                ? '&source=carwow'
                : ''
            }")`}
          />
          <br />
          {!this.props.shareOption.isOn() ? null : (
            <div>
              <button className={buttons.btn} onClick={clickGoogleSheets}>
                <FontAwesomeIcon
                  style={{ color: '#0F9D58', margin: '0 10px 0 0px' }}
                  icon="table"
                />{' '}
                Create new Google Sheet
              </button>
            </div>
          )}
        </div>
        <div className={`${css.shareOption} margin-top-20`}>
          <Tip
            content={advancedContent}
            type={INFO}
            className="margin-top-20"
          />
        </div>
      </div>
    );
  }
}

export default GoogleSheetsEditor;
