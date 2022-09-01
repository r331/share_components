import React, { Component } from 'react';
import css from '../../../css/module/share-insight.css';
import buttons from '../../../css/module/buttons.css';
import flex from '../../../css/module/flex.css';
import { currentTimezone, formatTimeAMPM, post } from '../../../util';
import Tip, { INFO } from '../../Tip';
import S3BucketShareRef, {
  S3_BUCKET,
  S3_REGION,
} from '../../../util/S3BucketShareRef';
import S3BucketEditorEditMode from './S3BucketEditorEditMode';
import ShareOptionS3Bucket from '../options/ShareOptionS3Bucket';
import { DAILY } from '../../modals/ModalAddAlert';

const credentialsMeta = {
  [S3_BUCKET]: {
    name: 'Bucket',
    placeholder: 'e.g. my-s3-bucket',
    hideValue: false,
  },
  [S3_REGION]: {
    name: 'Region',
    placeholder: 'e.g. us-east-1',
    hideValue: false,
  },
};

const CREDENTIALS = [S3_BUCKET, S3_REGION];

class S3BucketEditor extends Component {
  constructor(props) {
    super(props);
    const { shareOption } = props;
    this.state = {
      editMode: !shareOption.shareRef().id(), // true by default if not set up yet
    };

    this.saveToServer = this.saveToServer.bind(this);
    this.toggleEditMode = this.toggleEditMode.bind(this);
  }

  // hour is an ISO timestamp. credentials is an object.
  saveToServer(hour, credentials, scheduledFrequency) {
    const { onUpdateOption, viewToShare, shareOption } = this.props;
    post('saving bucket details', `/views/${viewToShare.id()}/bucketFeeds`, {
      existingId: shareOption.shareRef().id() || null,
      timezone: currentTimezone(),
      time: hour,
      scheduledFrequency,
      bucket: credentials[S3_BUCKET],
      region: credentials[S3_REGION],
    }).then((json) => {
      this.toggleEditMode();
      // id, credentials, viewSeries, disabled, time, errorMessage
      const newRef = new S3BucketShareRef(
        json.id,
        credentials,
        viewToShare.series(),
        false,
        hour,
        scheduledFrequency,
        null,
      );
      const clonedOption = new ShareOptionS3Bucket(newRef);
      // this updates the sharing options in ShareInsightPage
      onUpdateOption(clonedOption);
    });
  }

  toggleEditMode() {
    this.setState({
      editMode: !this.state.editMode,
    });
  }

  readOnly() {
    const { shareOption } = this.props;

    const activeClass = !shareOption.shareRef().disabled() ? css.active : '';

    return (
      <div>
        <div className={css.shareOption}>
          <h5>Deliver results</h5>
          <div>
            <span
              onClick={this.toggleEditMode}
              className={`${css.tag} ${activeClass}`}
            >
              {shareOption.shareRef().scheduledFrequency === DAILY ? (
                <span>
                  Daily at {formatTimeAMPM(shareOption.shareRef().time())}
                </span>
              ) : (
                <span>Hourly</span>
              )}
            </span>
          </div>
        </div>
        <div className={css.shareOption}>
          <h5>S3 Bucket</h5>
          <span
            onClick={this.toggleEditMode}
            className={`${css.tag} ${activeClass}`}
          >
            <span>
              Bucket: {shareOption.shareRef().credentials()[S3_BUCKET]}
            </span>
          </span>
          <span
            onClick={this.toggleEditMode}
            className={`${css.tag} ${activeClass}`}
          >
            <span>
              Region: {shareOption.shareRef().credentials()[S3_REGION]}
            </span>
          </span>
        </div>
        <div className={css.shareOption}>
          <button
            onClick={this.toggleEditMode}
            className={`${buttons.btn} margin-top-10 margin-right-5 ${buttons.rounded} ${buttons.lg}`}
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { viewToShare } = this.props;

    const advancedContent = (
      <div>
        <div className={css.shareOption}>
          <h5>Instructions</h5>
          <ol>
            <li>Enter the name of the bucket and the region.</li>
            <li>Attach the bucket policy (the JSON above) to your bucket.</li>
            <li>
              Click the <b>Test connection</b> to confirm it works.
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

    return (
      <div className={css.shareSection}>
        <div className={css.alertExplanationContainer}>
          <div className={css.shareOption}>
            <div className={`${flex.row} ${flex.alignItemsCenter}`}>
              <div className={css.showcaseImg}>
                <div className={css.showcasePreviewContainer}>
                  <table className={`table-bordered ${css.showcaseTable}`}>
                    <thead>
                      <tr>
                        <th>id</th>
                        <th>partner</th>
                        <th>city</th>
                        <th>results</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Amazon</td>
                        <td>Austin</td>
                        <td>42</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Facebook</td>
                        <td>Van Couver</td>
                        <td>37</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Stitch</td>
                        <td>New York</td>
                        <td>29</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={css.showcaseText}>
                <h5>
                  <b>Send results to Amazon S3</b>
                </h5>
                <span style={{ fontSize: '1.1em' }}>
                  Deliver query results (.csv) to an Amazon S3 bucket.
                </span>
              </div>
            </div>
          </div>
        </div>
        {this.state.editMode ? (
          <S3BucketEditorEditMode
            shareOption={this.props.shareOption}
            credentialsArray={CREDENTIALS}
            meta={credentialsMeta}
            viewToShare={viewToShare}
            saveToServer={this.saveToServer}
            toggleEditMode={this.toggleEditMode}
            isBusiness={this.props.isBusiness}
          />
        ) : (
          this.readOnly()
        )}
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

export default S3BucketEditor;
