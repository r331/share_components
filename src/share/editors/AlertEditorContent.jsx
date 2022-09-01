import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import css from '../../../css/module/share-insight.css';
import flex from '../../../css/module/flex.css';
import buttons from '../../../css/module/buttons.css';
import AlertRef, { EMAIL } from '../../../util/AlertRef';
import {
  post,
  currentTimezone,
  userAction,
  formatTimeAMPM,
} from '../../../util';
import AjaxSpinner from '../../AjaxSpinner';
import SelectHour from '../../SelectHour';
import Tip, { INFO } from '../../Tip';
import {
  NEW_RESULTS,
  ALWAYS,
  DAILY,
  HOURLY,
  MINS10,
  HOURLYTEXT,
  MINS10TEXT,
} from '../../../util/enums/EnumCreateAlert';

// labels
const INCLUDE_NEW_ROWS = 'every new row';
const INCLUDE_CHANGED_ROWS = 'every new or changed row';
const INCLUDE_ALL_ROWS = 'every row (changed or otherwise)';

class AlertEditorContent extends Component {
  constructor(props) {
    super(props);
    const { shareOption } = props;
    this.state = {
      editMode: shareOption.alert().recipients().length === 0,
      isSaving: false,
      error: false,
      stagingTrigger: shareOption.alert().trigger(), // one of NEW_RESULTS or ALWAYS
      stagingShowChanged: shareOption.alert().showChanged(), // true or false
      stagingFrequency: shareOption.alert().frequency(), // daily, hourly or mins10
      stagingHour: shareOption.alert().time(), // ISO timestamp
      showInfo: false, // boolean determining whether "show condition" text is visible
    };

    this.cancelClicked = this.cancelClicked.bind(this);
    this.doneClicked = this.doneClicked.bind(this);
    this.editClicked = this.editClicked.bind(this);
    this.setHour = this.setHour.bind(this);
  }

  doneClicked() {
    const { stagingShowChanged, stagingFrequency } = this.state;
    const { shareOption, viewToShare } = this.props;
    const type = shareOption.triggerType();

    userAction(`use-add-${type}-alert`);
    this.setState({
      isSaving: true,
      error: false,
    });
    const alertSaveState = this.props.alertSaveState({
      _existingId: shareOption.alert().id(),
      _chosen: viewToShare, // ViewRef
      _frequency: stagingFrequency,
      _trigger: this.state.stagingTrigger,
      _showChanged: stagingShowChanged,
      _timezone: currentTimezone(),
      _time: this.state.stagingHour,
      _triggerType: type,
    });
    post(`saving ${type} alert`, '/alerts', alertSaveState)
      .then((json) => {
        const newAlert = json._alerts
          .map((a) => AlertRef.build(a))
          .find((a) => a.id() === json._newAlertId);
        this.setState({
          isSaving: false,
          editMode: false,
        });
        this.props.saveAlert(newAlert);
      })
      .catch((e) => {
        this.setState({
          isSaving: false,
          error: true,
        });
        window.console.error('Problem saving alert', e);
      });
  }

  cancelClicked() {
    const { shareOption } = this.props;

    const showChanged = shareOption.alert().showChanged();
    const frequency = shareOption.alert().frequency();

    this.setState({
      editMode: false,
      stagingFrequency: frequency,
      stagingShowChanged: showChanged,
      isSaving: false,
      error: false,
    });
    this.props.cancelClicked();
  }

  editClicked() {
    this.setState({
      editMode: true,
    });
  }

  selectFrequency(e) {
    this.setState({
      stagingFrequency: e.target.value,
    });
  }

  saveButton() {
    const validate = this.props.readyToSave();

    const button = (
      <button
        className={`${buttons.btn} ${buttons.lg} ${buttons.rounded} ${buttons.dark}`}
        onClick={this.doneClicked}
        disabled={this.isEmail() ? !validate : validate.length > 0}
      >
        Save and activate
      </button>
    );

    if (this.isEmail() || validate.length === 0) {
      return button;
    }
    return (
      <span>
        <span data-tip data-for="activate">
          {button}
        </span>
        <ReactTooltip id="activate" effect="solid">
          Please{' '}
          {validate.map((item, i) => {
            const grammar =
              i === 0 ? '' : i === validate.length - 1 ? ' and ' : ', ';
            return (
              <span key={i}>
                {grammar}
                {item}
              </span>
            );
          })}
        </ReactTooltip>
      </span>
    );
  }

  frequencyOptions() {
    const { isProPlus } = this.props;
    const options = [HOURLY, MINS10].map((o, i) => {
      let disabled = false;
      let value;
      let upgradeMessage = '';
      if (o === HOURLY) {
        value = HOURLYTEXT;
      } else if (o === MINS10) {
        value = MINS10TEXT;
        disabled = !isProPlus;
        upgradeMessage = !isProPlus ? '(upgrade to Trevor Business)' : '';
      }
      return (
        <option key={i} value={o} disabled={disabled}>
          {`${value} ${upgradeMessage}`}
        </option>
      );
    });
    return options;
  }

  setHour(time) {
    this.setState({
      stagingHour: time,
    });
  }

  editMode() {
    const { shareOption, isLite } = this.props;

    const TRIGGER_DAILY = 'trigger_daily';
    const TRIGGER_ON_CHANGE = 'trigger_on_change';

    const onChangeTrigger = (e) => {
      const newValue = e.target.value;
      switch (newValue) {
        case TRIGGER_DAILY:
          this.setState({
            stagingFrequency: DAILY,
          });
          break;
        default:
          this.setState({
            stagingFrequency: HOURLY,
          });
          break;
      }
    };

    const onChangeInclude = (e) => {
      const newValue = e.target.value;
      switch (newValue) {
        case INCLUDE_ALL_ROWS:
          this.setState({
            stagingTrigger: ALWAYS,
            stagingShowChanged: false,
          });
          break;
        case INCLUDE_NEW_ROWS:
          this.setState({
            stagingTrigger: NEW_RESULTS,
            stagingShowChanged: false,
          });
          break;
        case INCLUDE_CHANGED_ROWS:
          this.setState({
            stagingTrigger: NEW_RESULTS,
            stagingShowChanged: true,
          });
          break;
      }
    };

    return (
      <div>
        <div className={css.shareOption}>
          <h5>Trigger alert</h5>
          <div className={flex.alignItemsBaseline}>
            <div className={`${flex.column} full-width`}>
              <div
                className={`${flex.row} full-width ${flex.alignItemsCenter}`}
              >
                <select
                  className="form-control"
                  value={
                    this.state.stagingFrequency === DAILY
                      ? TRIGGER_DAILY
                      : TRIGGER_ON_CHANGE
                  }
                  onChange={onChangeTrigger}
                >
                  <option value={TRIGGER_DAILY}>Daily</option>
                  <option disabled={isLite} value={TRIGGER_ON_CHANGE}>
                    Whenever results change
                    {!isLite ? null : ' (upgrade to Pro)'}
                  </option>
                </select>
                {this.state.stagingFrequency !== DAILY ? (
                  <div
                    style={{
                      color: '#666',
                      marginLeft: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      this.setState({ showInfo: !this.state.showInfo })
                    }
                  >
                    Want to add a condition?
                    {this.state.showInfo ? (
                      <FontAwesomeIcon
                        icon="caret-down"
                        style={{ marginLeft: '5px', fontSize: '1.1em' }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon="caret-right"
                        style={{ marginLeft: '5px', fontSize: '1.1em' }}
                      />
                    )}
                  </div>
                ) : (
                  <div className={flex.alignItemsBaseline}>
                    <span className="margin-left-10 margin-right-10">at</span>
                    <SelectHour
                      onChange={this.setHour}
                      chosenTime={this.state.stagingHour}
                    />
                  </div>
                )}
              </div>
              {!this.state.showInfo ? null : (
                <div className="margin-top-20">
                  <p>
                    E.g. only trigger this alert if{' '}
                    <em>customer name is Amazon</em>, or if{' '}
                    <em style={{ whiteSpace: 'nowrap' }}>count &gt; 10</em>.
                  </p>
                  <p>
                    No problem! Just add the appropriate filter to your query
                    before setting up this alert.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {this.state.stagingFrequency === DAILY ? null : (
          <div className={css.shareOption}>
            <h5>Check for changes</h5>
            <select
              className="form-control margin-right-10"
              value={this.state.stagingFrequency}
              onChange={(e) => this.selectFrequency(e)}
            >
              {this.frequencyOptions()}
            </select>
          </div>
        )}
        <div className={css.shareOption}>
          <h5>{this.includeMsg()}</h5>
          <select
            className="form-control"
            value={
              this.state.stagingTrigger === ALWAYS
                ? INCLUDE_ALL_ROWS
                : this.state.stagingShowChanged
                ? INCLUDE_CHANGED_ROWS
                : INCLUDE_NEW_ROWS
            }
            onChange={onChangeInclude}
          >
            <option value={INCLUDE_NEW_ROWS}>{INCLUDE_NEW_ROWS}</option>
            <option value={INCLUDE_CHANGED_ROWS}>{INCLUDE_CHANGED_ROWS}</option>
            {this.isEmail() ? null : (
              <option value={INCLUDE_ALL_ROWS}>{INCLUDE_ALL_ROWS}</option>
            )}
          </select>
        </div>

        {this.props.editMode()}
        <div className={`${css.shareOption} margin-top-10`}>
          <div className={flex.alignItemsCenter}>
            {shareOption.alert().recipients().length === 0 ? null : (
              <button
                className={`${buttons.btn} ${buttons.lg} ${buttons.rounded} margin-right-5`}
                onClick={this.cancelClicked}
              >
                Cancel
              </button>
            )}
            {this.state.isSaving === true ? (
              <AjaxSpinner small />
            ) : (
              this.saveButton()
            )}
          </div>
          {!this.state.error ? null : (
            <div className={`${css.warning} alert alert-warning`}>
              Oops, something went wrong. Please try again.
            </div>
          )}
        </div>
      </div>
    );
  }

  isEmail() {
    return this.props.shareOption.triggerType() === EMAIL;
  }

  includeMsg() {
    return this.isEmail() ? 'Send a summary of' : 'Send a slack message for';
  }

  readOnlyMode() {
    const { shareOption } = this.props;
    const showChanged = shareOption.alert().showChanged();
    const frequency = shareOption.alert().frequency();
    const isAll = shareOption.alert().trigger() === ALWAYS;
    const activeClass = this.props.shareOption.isOn() ? css.active : '';
    const frequencyValue =
      frequency === DAILY ? (
        <span>Daily at {formatTimeAMPM(shareOption.alert().time())}</span>
      ) : (
        'Whenever results change'
      );

    const recipients = shareOption
      .alert()
      .recipients()
      .map((e) => (
        <span
          onClick={this.editClicked}
          key={e}
          className={`${css.tag} ${activeClass}`}
        >
          {e}
        </span>
      ));
    return (
      <div>
        <div className={css.shareOption}>
          <h5>Trigger alert</h5>
          <div>
            <span
              onClick={this.editClicked}
              className={`${css.tag} ${activeClass}`}
            >
              {frequencyValue}
            </span>
          </div>
        </div>
        <div className={css.shareOption}>
          <h5>{this.includeMsg()}</h5>
          <div>
            <span
              onClick={this.editClicked}
              className={`${css.tag} ${activeClass}`}
            >
              {isAll
                ? INCLUDE_ALL_ROWS
                : showChanged
                ? INCLUDE_CHANGED_ROWS
                : INCLUDE_NEW_ROWS}
            </span>
          </div>
        </div>

        {this.props.readOnlyMode(recipients, this.editClicked)}
        <div className={css.shareOption} style={{ marginTop: '10px' }}>
          <button
            className={`${buttons.btn} ${buttons.rounded}`}
            onClick={this.editClicked}
          >
            Edit alert
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { isFreePlan, explanation } = this.props;
    const { editMode } = this.state;

    const advancedContent = (
      <div>
        <div className={css.shareOption}>
          <h5>Triggers</h5>
          <p>
            <b>Daily</b>: your alert will be triggered every day at the same
            time.
          </p>
          <p>
            <b>Whenever results change</b>: Trevor will regularly re-run your
            query, checking if there are new or changed rows in the results. If
            there are it will trigger your alert.
          </p>
          <p>
            <b>New vs changed row</b>: Trevor uses the <b>first column</b> in
            your results as a unique key to decide if a row is new or exists
            already.
          </p>
        </div>
        <div className={css.shareOption}>
          <h5>Row limits</h5>
          <p>
            Only the first {isFreePlan ? '100' : '10,000'} rows will be checked{' '}
            {isFreePlan
              ? '(upgrade to Trevor Pro for more)'
              : '(Tip: make sure to sort your rows so that recent rows appear near the top)'}
            .
          </p>
        </div>
        <div className={css.shareOption}>
          <h5>Need help?</h5>
          <p>
            We're happy to help!{' '}
            <span className="link" onClick={() => Intercom('show')}>
              Chat with us
            </span>
            .
          </p>
        </div>
      </div>
    );

    return (
      <div className={css.shareSection}>
        <div className={css.alertExplanationContainer}>
          <div className={css.shareOption}>
            {explanation() ? explanation() : null}
          </div>
        </div>
        {editMode ? this.editMode() : this.readOnlyMode()}
        <div className={css.shareOption}>
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

const mapStateToProps = (state) => {
  return {
    isProPlus: state.datasource.isProPlus,
    isFreePlan: state.datasource.maxSteps < 999,
    isLite: state.datasource.isLite,
  };
};

export default connect(mapStateToProps)(AlertEditorContent);
