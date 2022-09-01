import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import css from '../../../css/module/share-insight.css';
import buttons from '../../../css/module/buttons.css';
import flex from '../../../css/module/flex.css';
import {
  currentTimezone,
  datasourceUrlPrefix,
  post,
  userAction,
} from '../../../util';
import SelectHour from '../../SelectHour';
import { S3_BUCKET, S3_REGION } from '../../../util/S3BucketShareRef';
import AceEditorReadOnly from '../../AceEditorReadOnly';
import AjaxSpinner from '../../AjaxSpinner';
import { DAILY, HOURLY } from '../../../util/enums/EnumCreateAlert';

class S3BucketEditorEditMode extends Component {
  constructor(props) {
    super(props);
    const { shareOption } = props;
    this.state = {
      stagingHour: shareOption.shareRef().time(), // ISO timestamp
      stagingCredentials: shareOption.shareRef().credentials(), // object with S3_BUCKET, S3_REGION keys, or empty.
      testingConnection: false,
      stagingFrequency: DAILY,
      // testConnectionTried: false,
      testConnectionSuccess: false,
    };
    this.updateStagingCredentials = this.updateStagingCredentials.bind(this);
    this.testConnection = this.testConnection.bind(this);
  }

  testConnection() {
    const { stagingCredentials } = this.state;
    const { viewToShare } = this.props;
    this.setState({
      testingConnection: true,
    });
    post('testing S3 bucket', `/views/${viewToShare.id()}/bucketFeeds/test`, {
      bucketName: stagingCredentials[S3_BUCKET],
      region: stagingCredentials[S3_REGION],
      timezone: currentTimezone(),
    })
      .then(() => {
        this.setState({
          testingConnection: false,
          testConnectionSuccess: true,
        });
      })
      .catch(() =>
        this.setState({
          testingConnection: false,
        }),
      );
  }

  credentialsInputs() {
    const { stagingCredentials } = this.state;
    const { credentialsArray, meta } = this.props;
    return credentialsArray.map((c, i) => {
      const value = stagingCredentials[c] || '';
      return (
        <div key={i} className={`input-group ${css.credentialsInput}`}>
          <span
            style={{ minWidth: '100px' }}
            className="input-group-addon text-align-left"
          >
            {meta[c].name}
          </span>
          <input
            type={meta[c].hideValue ? 'password' : 'text'}
            className="form-control"
            placeholder={meta[c].placeholder}
            value={value}
            disabled={false}
            onChange={(e) =>
              this.updateStagingCredentials(
                e.target.value.toLowerCase().replace(' ', '-'),
                c,
              )
            }
          />
        </div>
      );
    });
  }

  updateStagingCredentials(value, key) {
    const { stagingCredentials } = this.state;
    const newObj = {
      ...stagingCredentials,
      [key]: value,
    };
    this.setState({
      stagingCredentials: newObj,
      testConnectionSuccess: false,
    });
  }

  JSON(bucket) {
    return {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: this.props.s3UserArn,
          },
          Action: 's3:PutObject',
          Resource: `arn:aws:s3:::${bucket}/trevor.io/*`,
        },
      ],
    };
  }

  validateCredentials() {
    const { credentialsArray, isBusiness } = this.props;
    const sc = this.state.stagingCredentials;
    // if the form hasn't been filled out, or the user is not on the business plan, the buttons remain disabled.
    return (
      !isBusiness || credentialsArray.some((c) => !sc[c] || sc[c].length < 3)
    );
  }

  handleClickUpgradeButton() {
    window.open(`${datasourceUrlPrefix()}#billing`, '_blank');
    userAction('click-upgrade-in-share-to-s3-bucket-modal');
  }

  handleSelectStagingFrequency = (e) => {
    const newValue = e.target.value;
    this.setState({
      stagingFrequency: newValue,
    });
  };

  render() {
    const { shareOption, isBusiness } = this.props;
    const {
      stagingHour,
      stagingCredentials,
      testingConnection,
      testConnectionSuccess,
    } = this.state;
    const bucket = stagingCredentials[S3_BUCKET] || 'bucket-name-here';
    return (
      <div className={`${css.editContainer} position-relative`}>
        {isBusiness ? null : ( // only business users can access this
          <div className={css.businessCover}>
            <div className={css.businessCoverInner} />
            <div
              className={`${css.businessCoverButton} ${flex.column}`}
              style={{ zIndex: '5' }}
            >
              <button
                onClick={this.handleClickUpgradeButton}
                className={`${buttons.btn} ${buttons.dark} ${buttons.rounded} ${buttons.lg}`}
              >
                <FontAwesomeIcon icon="gamepad" />
                &nbsp; Upgrade to Business
              </button>
              <p className="text-align-center margin-top-15">
                Send results to S3
                <br />
                and more.
              </p>
            </div>
          </div>
        )}
        <div className={css.shareOption}>
          <h5>Deliver results</h5>
          <select
            value={this.state.stagingFrequency}
            className="form-control"
            onChange={this.handleSelectStagingFrequency}
          >
            <option value={DAILY}>Daily</option>
            <option value={HOURLY}>Hourly</option>
          </select>
          <div className={`${flex.row} ${flex.alignItemsCenter} margin-top-10`}>
            {this.state.stagingFrequency === DAILY && (
              <>
                <span className="margin-right-10">Daily at</span>
                <SelectHour
                  onChange={(hour) => this.setState({ stagingHour: hour })}
                  chosenTime={this.state.stagingHour}
                />
              </>
            )}
          </div>
        </div>
        <div className={css.shareOption}>
          <h5>Connect to S3 Bucket</h5>
          <div className="margin-top-20">
            <div className={`${flex.row} w-100 ${flex.alignItemsCenter}`}>
              <div style={{ width: '400px' }}>{this.credentialsInputs()}</div>
              {testConnectionSuccess ? (
                <span className={`${flex.alignItemsCenter} margin-left-15`}>
                  <span
                    className="margin-right-5"
                    style={{ color: '#53ba8d', fontSize: '1.8em' }}
                  >
                    <FontAwesomeIcon icon="check-circle" />
                  </span>
                  <span>Connection successful!</span>
                </span>
              ) : (
                <div>
                  <div className={css.testConnectionContainer}>
                    {testingConnection ? (
                      <AjaxSpinner small />
                    ) : (
                      <button
                        onClick={this.testConnection}
                        disabled={this.validateCredentials()}
                        className={`${buttons.btn} ${buttons.lg} ${buttons.rounded} ${buttons.dark}`}
                      >
                        Test connection
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={css.shareOption}>
          <h5>Bucket Policy</h5>
          <p>
            Add this JSON to your Bucket policy (Amazon S3 &gt; Buckets &gt;
            your-bucket &gt; Permissions &gt; Bucket policy)
          </p>
          <div className="margin-top-20">
            <AceEditorReadOnly
              key={bucket}
              initialJSON={this.JSON(bucket)}
              isJSON
              disableCopy={
                !stagingCredentials[S3_BUCKET] ||
                stagingCredentials[S3_BUCKET].length === 0
              }
            />
          </div>
        </div>
        <div
          className={`${css.shareOption} margin-top-30 ${flex.alignItemsCenter}`}
        >
          {!shareOption.shareRef().id() ? null : (
            <button
              onClick={this.props.toggleEditMode}
              className={`${buttons.btn} margin-right-10 ${buttons.rounded} ${buttons.lg}`}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              this.props.saveToServer(
                stagingHour,
                stagingCredentials,
                this.state.stagingFrequency,
              );
            }}
            disabled={this.validateCredentials()}
            className={`${buttons.btn} ${buttons.rounded} ${buttons.lg} ${buttons.dark}`}
          >
            Save and activate
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    s3UserArn: state.datasource.s3UserArn,
  };
};

export default connect(mapStateToProps)(S3BucketEditorEditMode);
