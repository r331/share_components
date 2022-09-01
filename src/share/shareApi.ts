import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
// @ts-ignore
import type {UUID} from '@/types';
// @ts-ignore
import {DateTimeString} from "@/types";

enum AlertFrequency {
    DAILY,
    HOURLY,
    MINS10
}

enum AlertTriger {
    always,
    new_results
}

enum TriggerType {
    email,
    slack,
    zapier
}

interface Alerts {
    _id: UUID;
    _name: string;
    _trigger: AlertTriger;
    _frequency: AlertFrequency;
    _recipients: string[]
    _viewSeries: UUID;
    _showChanged: boolean;
    _disabled: boolean;
    _triggerType: TriggerType;
    _message: string;
    _time: DateTimeString;
}

enum BucketFeedDelivery {
    daily,
    hourly
}

interface BucketFeed {
    id: UUID;
    viewSeries: UUID;
    bucket_name: string;
    region: string;
    time: DateTimeString;
    timezone: string;
    disabled : boolean;
    scheduledFrequency : BucketFeedDelivery;
}

export type GetShareInfo = {
    alerts: Alerts[];
    savedQueries: BucketFeed[];
    isSheetsShareable: boolean;
    isGoogleSheetsActive: boolean;
    isOtherShareable: boolean;
};

export const shareApi = createApi({
    reducerPath: 'shareInfoApi',
    tagTypes: ['ShareOptions'],
    baseQuery: fetchBaseQuery({
        baseUrl: '/',
        credentials: 'same-origin',
    }),
    endpoints: (builder) => ({
        getShareInfo: builder.query<GetShareInfo, { datasourceId: UUID; viewId: UUID }>({
            query: (arg) => {
                const { datasourceId, viewId } = arg;
                console.log('arg: ', arg);
                return {
                    url: `datasources/${datasourceId}/views/${viewId}/share`,
                    params: { datasourceId, viewId },
                };
            }
        }),
        saveShareInfo: builder.mutation<GetShareInfo, { datasourceId: UUID; viewId: UUID }>({
            query: (arg) => {
                const { datasourceId, viewId } = arg;
                console.log('arg: ', arg);
                return {
                    url: `datasources/${datasourceId}/views/${viewId}/share`,
                    params: { datasourceId, viewId },
                };
            }
        })
    }),
});

export const {useGetShareInfoQuery, usePrefetch} = shareApi;
