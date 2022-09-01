import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import css from '../../css/module/share-insight.css';
import DropdownItem from '../../util/DropdownItem';
import MultiDropdown from '../MultiDropdown';
import DropdownButton from '../DropdownButton';
import ShareOptionHeader from './ShareOptionHeader';
import { safeOnClick } from '../../util';
import AlertRef, { EMAIL, SLACK } from '../../util/AlertRef';
import S3BucketShareRef from '../../util/S3BucketShareRef';
import ShareOptionEmailAlert from './options/ShareOptionEmailAlert';
import ShareOptionSlackAlert from './options/ShareOptionSlackAlert';
import ShareOptionZapier from './options/ShareOptionZapier';
import ShareOptionS3Bucket from './options/ShareOptionS3Bucket';
import ShareOptionGoogleSheets from './options/ShareOptionGoogleSheets';
import ShareOptionOtherTools from './options/ShareOptionOtherTools';

class ShareLeftSidebar extends Component {
  // for each share option, return a sidebarOption
  sidebar(options) {
    const { viewToShare, feedsDisabled, alertsDisabled, isSelfHosted } =
      this.props;
    const requiresSave = !viewToShare;

    const display = options.map((o, i) => this.sidebarOption(o, i));

    const addNewEmailAlert = alertsDisabled
      ? null
      : DropdownItem.action(<span>Add new Email alert</span>, () =>
          this.props.addNewShareOption(
            new ShareOptionEmailAlert(AlertRef.empty(EMAIL)),
          ),
        );

    const addNewSlackAlert = alertsDisabled
      ? null
      : DropdownItem.action(<span>Add new Slack alert</span>, () =>
          this.props.addNewShareOption(
            new ShareOptionSlackAlert(AlertRef.empty(SLACK)),
          ),
        );

    const addNewS3BucketFeed = DropdownItem.action(
      <span>Add new S3 Bucket feed</span>,
      () =>
        this.props.addNewShareOption(
          new ShareOptionS3Bucket(S3BucketShareRef.empty()),
        ),
    );

    const addNewZap = isSelfHosted
      ? null
      : DropdownItem.action(
          <span>
            Add new Zap <small className="faint">(opens Zapier.com)</small>
          </span>,
          () =>
            window.open(
              'https://zapier.com/apps/trevor/integrations',
              '_blank',
            ),
        );

    const menuOptions = [
      addNewSlackAlert,
      addNewEmailAlert,
      addNewS3BucketFeed,
      addNewZap,
    ];

    return (
      <div
        className={css.optionsContainer}
        ref={(el) => (window.trevzShareModalSidebar = el)}
      >
        <div>
          {display}
          <div className={css.addNewOption}>
            {requiresSave || feedsDisabled ? null : (
              <DropdownButton
                contentBuilder={() => <MultiDropdown items={menuOptions} />}
              >
                <span>
                  <span data-tip data-for="addNewShareOption">
                    <span
                      className={`${css.pointer} glyphicon glyphicon-plus padding-left-5 padding-right-5`}
                    />
                  </span>
                  <ReactTooltip id="addNewShareOption" effect="solid">
                    <span>Add new share option</span>
                  </ReactTooltip>
                </span>
              </DropdownButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  disabledFeature(option) {
    const { alertsDisabled, exportsDisabled, feedsDisabled } = this.props;

    //
    // NOTE: scalapay want to disable google sheets + other tools, but want to enable S3 bucket feeds, on self hosted
    //
    return (
      ((option instanceof ShareOptionSlackAlert ||
        option instanceof ShareOptionEmailAlert ||
        option instanceof ShareOptionZapier) &&
        (alertsDisabled || feedsDisabled)) ||
      ((option instanceof ShareOptionGoogleSheets ||
        option instanceof ShareOptionOtherTools) &&
        (exportsDisabled || feedsDisabled)) ||
      ((option instanceof ShareOptionS3Bucket ||
        option instanceof ShareOptionZapier) &&
        feedsDisabled)
    );
  }

  // create left sidebar options html
  sidebarOption(option, index) {
    const { viewToShare, feedsDisabled } = this.props;

    if (option instanceof ShareOptionHeader) {
      return (
        <div key={index} className={css.shareOptionHeader}>
          {option.title()}
        </div>
      );
    }

    const requiresSave = !viewToShare && option.requiresSavedInsight();

    const disabled = requiresSave || this.disabledFeature(option);

    const className = `${css.sidebarOption} ${
      this.props.selected === index ? css.selectedSidebarOption : ''
    } ${disabled ? css.disabledOption : ''}`;

    const innerClass = `${css.sidebarInner} ${disabled ? css.opaque : ''}`;

    return (
      <div
        key={index}
        className={className}
        onClick={
          disabled
            ? null
            : safeOnClick(() => this.props.onSidebarOptionSelected(index))
        }
      >
        <div className={innerClass}>
          <div className={css.sideBarContent}>
            <div className={css.iconContainer}>{option.logo()}</div>
            <h5>{option.title()}</h5>
          </div>
          <div className={css.row}>
            {!option.hasToggleTag() || disabled ? null : (
              <span
                className={`${css.toggleTag} ${
                  option.isOn() ? css.toggleOn : css.toggleOff
                }`}
              >
                {option.isOn() ? 'active' : 'inactive'}
              </span>
            )}

            <div className={css.delete}>
              {!option.canDelete() || disabled ? null : (
                <DropdownButton
                  contentBuilder={() => (
                    <MultiDropdown
                      items={[
                        DropdownItem.dropdownWithConfirmation(
                          <span>Delete</span>,
                          () => this.props.confirmDelete(option),
                        ),
                      ]}
                    />
                  )}
                >
                  <span className={css.settings}>
                    <FontAwesomeIcon icon="ellipsis-v" />
                  </span>
                </DropdownButton>
              )}
            </div>
          </div>
        </div>
        {disabled ? (
          <div className={css.save}>
            <span className={`${css.tag} ${css.saveTag}`}>
              {requiresSave && !feedsDisabled && !this.disabledFeature(option)
                ? 'save first'
                : 'disabled by admin'}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  render() {
    const { viewToShare, options } = this.props;

    return (
      <div className={css.leftSidebar}>
        <div className={css.leftInner}>
          <div data-tip data-for="fullName" className={css.sidebarMainTitle}>
            <div className={css.sideBarContent}>
              <h5
                className={css.longTextBlockDiv}
                style={{ fontWeight: 600, color: '#14171a', fontSize: '14px' }}
              >
                {viewToShare ? viewToShare.name() : 'Unsaved query'}
              </h5>
            </div>
          </div>
          {viewToShare ? (
            <ReactTooltip
              id="fullName"
              className={css.fullNameTooltip}
              effect="solid"
              place="bottom"
            >
              <span>{viewToShare.name()}</span>
            </ReactTooltip>
          ) : (
            ''
          )}

          {this.sidebar(options)}
        </div>
      </div>
    );
  }
}

export default ShareLeftSidebar;
