/*
 * Copyright The Athenz Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import DomainDetails from '../../../components/header/DomainDetails';
import {
    getStateWithDomainData,
    buildDomainDataForState,
    renderWithRedux,
} from '../../../tests_utils/ComponentsTestUtils';
import { getExpiryTime } from '../../../redux/utils';
import MockApi from '../../../mock/MockApi';

const mockApi = {
    getMeta: jest.fn().mockReturnValue(
        new Promise((resolve, reject) => {
                resolve([])
            }
        )
    ),
}

beforeEach(() => {
    MockApi.setMockApi(mockApi);
})

afterEach(() => {
    MockApi.cleanMockApi();
})

describe('DomainDetails', () => {
    it('should render', () => {
        const domainMetadata = {
            modified: '2020-02-12T21:44:37.792Z',
            auditEnabled: false,
        };
        const domainData = buildDomainDataForState(domainMetadata);
        const { getByTestId } = renderWithRedux(
            <DomainDetails />,
            getStateWithDomainData(domainData)
        );
        const domainDetails = getByTestId('domain-details');
        expect(domainDetails).toMatchSnapshot();
    });
    it('should render with mock data', () => {

        const domainMetadata = {
            modified: '2020-02-12T21:44:37.792Z',
            ypmId: 'test',
            org: 'test',
            auditEnabled: true,
            account: 'test',
        };
        const domainData = buildDomainDataForState(domainMetadata);
        const { getByTestId } = renderWithRedux(
            <DomainDetails />,
            getStateWithDomainData(domainData)
        );
        const domainDetails = getByTestId('domain-details');
        expect(domainDetails).toMatchSnapshot();
    });
});
