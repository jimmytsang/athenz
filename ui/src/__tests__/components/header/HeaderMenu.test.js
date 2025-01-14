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
import { render, fireEvent } from '@testing-library/react';
import HeaderMenu from '../../../components/header/HeaderMenu';
import { renderWithRedux } from '../../../tests_utils/ComponentsTestUtils';
import MockApi from '../../../mock/MockApi';

describe('HeaderMenu', () => {
    afterEach(() => {
        MockApi.cleanMockApi();
    });
    it('should render', () => {
        let headerDetails = {
            headerLinks: [
                {
                    title: 'Website',
                    url: 'http://www.athenz.io',
                    target: '_blank',
                },
            ],
        };
        MockApi.setMockApi({
            getPendingDomainMembersList: jest.fn().mockReturnValue([]),
        });
        const { getByTestId } = renderWithRedux(
            <HeaderMenu headerDetails={headerDetails} />
        );
        const headerMenu = getByTestId('header-menu');
        expect(headerMenu).toMatchSnapshot();
    });
});
