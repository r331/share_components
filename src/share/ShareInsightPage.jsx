import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ShareOption from './options/ShareOption';
import ShareOptionHeader from './ShareOptionHeader';
import ShareOptionEmailAlert from './options/ShareOptionEmailAlert';
import ShareOptionSlackAlert from './options/ShareOptionSlackAlert';
import ShareOptionS3Bucket from './options/ShareOptionS3Bucket';
import ShareLeftSidebar from './ShareLeftSidebar';
import ShareOptionGoogleSheets from './options/ShareOptionGoogleSheets';
import ShareOptionZapier from './options/ShareOptionZapier';
import ShareOptionOtherTools from './options/ShareOptionOtherTools';
import css from '../../css/module/share-insight.css';
import flex from '../../css/module/flex.css';
import buttons from '../../css/module/buttons.css';
import ShareAsLinkEditor from './editors/ShareAsLinkEditor';
import DownloadResultsEditor from './editors/DownloadResultsEditor';
import ExportAsSqlEditor from './editors/ExportAsSqlEditor';
import AlertRef, { ZAPIER, EMAIL, SLACK } from '../../util/AlertRef';
import S3BucketShareRef from '../../util/S3BucketShareRef';
import { get, datasourceUrlPrefix, userAction } from '../../util';
import AjaxSpinner from '../AjaxSpinner';
import ModalContent from '../ModalContent';
import OnOffToggle from '../OnOffToggle';
import { SHARE_ACTIVE_BUTTON_PREFIX } from '../../constants/test-ids';

class ShareInsightPage extends Component {
  constructor(props) {
    super(props);

    const initialOption = props.initialOption || 1;

    this.state = {
      loading: true,
      toggling: false,
      alerts: [], // an array of AlertRefs,
      s3BucketFeeds: [], // an array of S3BucketShareRefs
      isSheetsShareable: false, // true if this view is actively being polled by google sheets.
      isOtherShareable: false, // true if this view is actively being polled by something other than google sheets.
      selected: initialOption, // the index of the option that is currently selected
      options: [], // the list of possible ShareOptions
    };
    this.confirmDelete = this.confirmDelete.bind(this);
    this.addNewShareOption = this.addNewShareOption.bind(this);
    this.buildOptions = this.buildOptions.bind(this);
    this.updateOption = this.updateOption.bind(this);
    this.saveAlert = this.saveAlert.bind(this);
    this.onSidebarOptionSelected = this.onSidebarOptionSelected.bind(this);
    this.removeOption = this.removeOption.bind(this);
  }

  componentDidMount() {
    userAction('open-share-page');

    const { viewToShare } = this.props;

    if (!viewToShare) {
      // view isn't saved, so no alerts, etc. to load
      this.buildOptions();
      return;
    }
    get('loading feeds for sharing', `/views/${viewToShare.id()}/share`)
      .then((json) => {
        this.setState({
          alerts: json._alerts.map((a) => AlertRef.build(a)),
          s3BucketFeeds: json._bucketFeeds.map((ref) =>
            S3BucketShareRef.build(ref),
          ),
          isSheetsShareable: json._isSheetsShareable,
          isOtherShareable: json._isOtherShareable,
        });
        this.buildOptions();
      })
      .catch((e) => window.console.error('problem loading alerts', e));
  }

  // create the options that will be displayed in the left section (normal share options + alerts + alert template etc)
  buildOptions() {
    const { alerts, isSheetsShareable, isOtherShareable, s3BucketFeeds } =
      this.state;

    const { isSelfHosted } = this.props;

    // main options
    const simpleShare = new ShareOption(
      'Share as link',
      false,
      ShareAsLinkEditor,
      false,
      <FontAwesomeIcon icon="link" className={css.sidebarIcon} />,
      false,
      false,
      false,
    );
    const downloadOption = new ShareOption(
      'Download',
      false,
      DownloadResultsEditor,
      false,
      <FontAwesomeIcon icon="cloud-download-alt" className={css.sidebarIcon} />,
      false,
      false,
      false,
    );
    const googleSheets = new ShareOptionGoogleSheets(isSheetsShareable);
    const SQL = new ShareOption(
      'Export as SQL',
      false,
      ExportAsSqlEditor,
      false,
      <FontAwesomeIcon icon="code" className={css.sidebarIcon} />,
      false,
      false,
      false,
    );

    const options = [];
    options.push(new ShareOptionHeader('Share results'));
    options.push(downloadOption);
    options.push(simpleShare);
    options.push(SQL);

    // live feed options
    options.push(new ShareOptionHeader('Live feeds'));
    options.push(googleSheets);

    // add all slack alerts to the options, or a template one
    const slackAlerts = alerts.filter((a) => a.triggerType() === SLACK);
    if (slackAlerts.length === 0) {
      options.push(new ShareOptionSlackAlert(AlertRef.empty(SLACK)));
    } else {
      slackAlerts.map((a) => options.push(new ShareOptionSlackAlert(a)));
    }

    // add all email alerts to the options, or a template one
    const emailAlerts = alerts.filter((a) => a.triggerType() === EMAIL);
    // for the template alert, push with an empty alert ref
    if (emailAlerts.length === 0) {
      options.push(new ShareOptionEmailAlert(AlertRef.empty(EMAIL)));
    } else {
      emailAlerts.map((a) => options.push(new ShareOptionEmailAlert(a)));
    }

    if (!isSelfHosted) {
      const zapierAlerts = alerts.filter((a) => a.triggerType() === ZAPIER);
      options.push(new ShareOptionZapier(zapierAlerts));
    }

    // add all s3 bucket feeds to the options, or a template one
    if (s3BucketFeeds.length === 0) {
      options.push(new ShareOptionS3Bucket(S3BucketShareRef.empty()));
    } else {
      s3BucketFeeds.map((a) => options.push(new ShareOptionS3Bucket(a)));
    }

    const otherTools = new ShareOptionOtherTools(isOtherShareable);
    options.push(otherTools);

    this.setState({
      options,
      loading: false,
    });
  }

  // used to create template
  emptyAlertRef(triggerType = EMAIL) {
    const emptyAlertRef = AlertRef.empty(triggerType);
    return emptyAlertRef;
  }

  // toggle option on and off
  onToggleSidebarOption(index) {
    const { viewToShare } = this.props;

    if (this.state.toggling) {
      // toggling is in progress
      return;
    }

    const option = this.state.options[index];
    // let the option itself handle the toggle
    this.setState({
      toggling: true,
    });
    option
      .toggle(viewToShare)
      .then((updated) => {
        this.updateOption(updated, index);
      })
      .finally(() => {
        this.setState({
          toggling: false,
        });
      });
  }

  toggle() {
    const { options, selected } = this.state;
    const option = options[selected];

    return (
      <div
        className={flex.alignItemsCenter}
        data-testid={`${SHARE_ACTIVE_BUTTON_PREFIX}:${
          option?.name?.() ?? option?.title?.()
        }`}
      >
        {this.state.toggling ? <AjaxSpinner small /> : null}
        <OnOffToggle
          value={option.isOn()}
          onChange={() => this.onToggleSidebarOption(selected)}
          disabled={this.state.toggling}
        />
      </div>
    );
  }

  // when an alert is saved, update the option state with the new version
  saveAlert(newRef) {
    const index = this.state.selected;
    const clone =
      newRef.triggerType() === SLACK
        ? new ShareOptionSlackAlert(newRef)
        : new ShareOptionEmailAlert(newRef);
    return this.updateOption(clone, index);
  }

  updateOption(clone, index) {
    this.setState({
      options: [
        ...this.state.options.slice(0, index),
        clone,
        ...this.state.options.slice(index + 1),
      ],
    });
  }

  // select sidebar element
  onSidebarOptionSelected(index) {
    this.setState({
      selected: index,
      delete: null,
    });
  }

  confirmDelete(optionToDelete) {
    const { viewToShare } = this.props;
    // const optionToDelete = this.state.delete;
    // TODO: move this logic inside the ShareOptionEmailAlert class
    // alert is not saved, so don't need to delete from server (just delete locally)

    const isBucketFeed = optionToDelete instanceof ShareOptionS3Bucket;

    if (
      ((optionToDelete instanceof ShareOptionEmailAlert ||
        optionToDelete instanceof ShareOptionSlackAlert) &&
        !optionToDelete.alert().id()) ||
      (isBucketFeed && !optionToDelete.shareRef().id())
    ) {
      this.removeOption(optionToDelete);
      return;
    }
    // call delete on the option itself, as it knows how to delete itself
    optionToDelete.delete(viewToShare.id()).then(() => {
      this.removeOption(optionToDelete);
      const type = isBucketFeed
        ? 'bucket-feed'
        : `${optionToDelete.triggerType()}-alert`;
      const refId = isBucketFeed
        ? optionToDelete.shareRef().id()
        : optionToDelete.alert().id();
      userAction(`delete-${type}`, {
        [isBucketFeed ? 'bucket_feed_id' : 'alert_id']: refId,
      });
    });
  }

  removeOption(optionToDelete) {
    // select first option
    this.onSidebarOptionSelected(1);
    // now delete the option that we want to delete
    const array = [...this.state.options];
    const index = array.indexOf(optionToDelete);
    array.splice(index, 1);
    this.setState({
      options: array,
    });
  }

  // for each option, show the relevant Editor component, passing in the relevant share option class.
  mainContent(option, viewToShare, rowRequestId) {
    if (option) {
      const Editor = option.editor();
      return (
        <Editor
          key={option.id()}
          notifyParent={() => this.turnOnToggleIfNotActive(option)}
          shareOption={option}
          viewToShare={viewToShare}
          rowRequestId={rowRequestId}
          onUpdateOption={(updated) =>
            this.updateOption(updated, this.state.selected)
          }
          saveAlert={this.saveAlert}
          isBusiness={this.props.isBusiness}
          exportsDisabled={this.props.exportsDisabled}
          feedsDisabled={this.props.feedsDisabled}
        />
      );
    }
    return null;
  }

  turnOnToggleIfNotActive(option) {
    if (!option.isOn()) this.onToggleSidebarOption(this.state.selected);
  }

  addNewShareOption(newOption) {
    const { options } = this.state;
    this.setState((prevState) => ({
      options: [...prevState.options, newOption],
    }));
    this.onSidebarOptionSelected(options.length);
  }

  render() {
    const { options, selected, loading } = this.state;
    const { isFreePlan, viewToShare, rowRequestId } = this.props;

    const upgradeURL = `${datasourceUrlPrefix()}/billing`;

    if (loading) {
      return <ModalContent loading />;
    }

    // returns selected option
    const main = options.find((o, i) => i === selected);

    return (
      <ModalContent>
        <div className={css.mainInner}>
          <ShareLeftSidebar
            options={options}
            viewToShare={viewToShare}
            onSidebarOptionSelected={this.onSidebarOptionSelected}
            selected={this.state.selected}
            addNewShareOption={this.addNewShareOption}
            confirmDelete={this.confirmDelete}
            alertsDisabled={this.props.alertsDisabled}
            exportsDisabled={this.props.exportsDisabled}
            feedsDisabled={this.props.feedsDisabled}
            isSelfHosted={this.props.isSelfHosted}
          />
          <div className={css.mainContent}>
            <div className={css.mainContainer}>
              <div className={css.rightColumnInner}>
                <div className={css.title}>
                  <div className={css.row}>
                    {main.logo()}
                    <span>{main.title()}</span>
                  </div>
                  <div className={flex.alignItemsCenter}>
                    {main.hasToggle() ? (
                      this.toggle()
                    ) : main.hasToggleTag() ? (
                      <span
                        style={{ width: '88px' }}
                        className={`${css.tag} ${css.tagLarge} ${
                          main.isOn() ? css.on : css.off
                        }`}
                      >
                        {main.isOn() ? 'Active' : 'Inactive'}
                      </span>
                    ) : null}
                  </div>
                </div>
                {this.mainContent(main, viewToShare, rowRequestId)}
              </div>
            </div>
          </div>
        </div>
        {!isFreePlan ? null : (
          <div className={css.upgradeBar}>
            <span>
              <span className={css.tag}>Free plan</span>
              <span>
                You can export up to <b>100 rows</b> at a time. Need more? Try
                Trevor Pro.
              </span>
            </span>
            <a
              href={upgradeURL}
              className={`${buttons.btn} ${buttons.dark} ${buttons.rounded} ${buttons.lg}`}
              target="_blank"
            >
              <b>Upgrade to Pro</b>
            </a>
          </div>
        )}
      </ModalContent>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isFreePlan: state.datasource.maxSteps < 999,
    isHeroku: state.datasource.isHerokuBeta,
    isBusiness: state.datasource.isProPlus,
    alertsDisabled: state.datasource.alertsDisabled,
    exportsDisabled: state.datasource.exportsDisabled,
    feedsDisabled: state.datasource.feedsDisabled,
    isSelfHosted: state.datasource.isSelfHosted,
  };
};

export default connect(mapStateToProps)(ShareInsightPage);
