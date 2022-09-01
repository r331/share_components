import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ViewRef from '@/util/ViewRef';
import { rootReducer } from '@/reducers/rootReducer';
import { AJAX_SPINNER, SHARE_ACTIVE_BUTTON_PREFIX } from '@/constants/test-ids';
import { UUID } from '@/types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ShareInsightPage from './ShareInsightPage';

let disabled: boolean;
afterEach(jest.clearAllMocks);

jest.mock('../../util/helpers/ajax-helpers', () => ({
  fetchJson: jest.fn(),
  datasourceId: jest.fn(),
  datasourceUrlPrefix: jest.fn(),
  userAction: jest.fn(),
  post: jest.fn((desc) => {
    if (desc.startsWith('toggling')) {
      return Promise.resolve(getResponse(!disabled));
    }
    return Promise.resolve([]);
  }),
  get: jest.fn((desc) => {
    if (desc === 'loading feeds for sharing') {
      return Promise.resolve(getResponse(disabled));
    }
    return Promise.resolve([]);
  }),
}));

const store = configureStore({
  reducer: rootReducer,
  preloadedState: {
    datasource: {},
  },
});

describe('ShareInsightPage', () => {
  it.each`
    alertDisabled
    ${true}
    ${false}
  `(
    'Given alert disabled = $alertDisabled, When select Slack, Then checkbox should be visible and !$$alertDisabled',
    async ({ alertDisabled }) => {
      disabled = alertDisabled;
      const viewToShare = new ViewRef(
        'some_id' as UUID,
        'some_name',
        'series' as UUID,
        'saved',
        [],
      );
      render(
        <Provider store={store}>
          <ShareInsightPage viewToShare={viewToShare} />
        </Provider>,
      );

      // select the Slack alert row
      const slackRow = await screen.findByText('Slack alert');
      await slackRow.click();
      // check that the right panel is rendered
      expect(
        await screen.findByText(/A custom message in Slack per triggered row/),
      ).toBeInTheDocument();

      // find the toggle button
      const slackButtonActive = await screen.findByTestId(
        `${SHARE_ACTIVE_BUTTON_PREFIX}:Slack`,
      );
      const checkbox = await within(slackButtonActive).getByRole('checkbox');

      // check it has correct initial state
      if (alertDisabled) {
        expect(checkbox).not.toBeChecked();
      } else {
        expect(checkbox).toBeChecked();
      }

      // toggle alert
      await checkbox.click();
      if (alertDisabled) {
        expect(checkbox).toBeChecked();
      } else {
        expect(checkbox).not.toBeChecked();
      }
      const spinner = await screen.findByTestId(AJAX_SPINNER);
      await waitFor(() => expect(spinner).not.toBeInTheDocument());
    },
  );
});

function getResponse(isDisabled: boolean) {
  return {
    _alerts: [
      {
        _disabled: isDisabled,
        _frequency: 'daily',
        _id: '157ade1c-baf8-4773-b05d-ba1f661fde9d',
        _message: 'some slack message',
        _name: 'Test slack alert',
        _recipients: ['@user'],
        _showChanged: false,
        _time: '2022-05-10T06:00:00Z',
        _trigger: 'new_results',
        _triggerType: 'slack',
        _viewSeries: '3ca5a721-3311-4fa6-8399-e0ac62457c8d',
      },
    ],
    _bucketFeeds: [],
  };
}
