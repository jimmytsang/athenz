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
import Button from '../../components/denali/Button';
import API from '../../api';
import Error from '../_error';
import styled from '@emotion/styled';
import createCache from '@emotion/cache';
import RequestUtils from '../../components/utils/RequestUtils';
import { selectIsLoading } from '../../redux/selectors/loading';
import { selectUserResourceAccessList } from '../../redux/selectors/user';
import { getUserResourceAccessList } from '../../redux/thunks/user';
import { connect } from 'react-redux';
import { CacheProvider } from '@emotion/react';
import { ReduxPageLoader } from '../../components/denali/ReduxPageLoader';

const GcpHeader = styled.header`
    border-bottom: 1px solid lightgray;
    margin: 10px;
    margin-bottom: 20px;
`;

const ParentWrapperDiv = styled.div`
    max-width: 800px;
    margin: 0 auto;
`;

const StyledP = styled.p`
    font-size: 16px;
`;

const RadioButtonsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 20px;
    font-weight: bold;
`;

const ProjectTitleDiv = styled.div`
    font-size: 18px;
    display: inline;
    border-bottom: 1px solid lightgray;
    margin-bottom: 10px;
    padding: 10px;
    width: 100%;
    display: block;
`;

const RadioButton = styled.input`
    vertical-align: middle;
    width: 18px;
    height: 18px;
    margin: 10px;
`;

const ProjectLabel = styled.label`
    margin: 0;
    font-weight: bold;
    font-size: 16px;
    color: #000;
    vertical-align: middle;
`;

const SubmitContainer = styled.div`
    display: flex;
`;

export async function getServerSideProps(context) {
    const api = API(context.req);
    const domains = await Promise.all([api.getForm()]).catch((err) => {
        let response = RequestUtils.errorCheckHelper(err);
        reload = response.reload;
        error = response.error;
        return [{}];
    });
    let reload = false;
    let notFound = false;
    let error = null;

    let queryParams = context.query || {};
    let isAdmin = queryParams.isAdmin === 'true';
    let projectDomainName = queryParams.projectDomainName || '';
    return {
        props: {
            reload,
            notFound,
            error,
            isAdmin,
            projectDomainName,
            _csrf: domains[0],
        },
    };
}

class GCPLoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.cache = createCache({
            key: 'athenz',
            nonce: this.props.nonce,
        });
        this.state = {
            errorMessage: '',
            showError: false,
            projectRoleMap: {},
            projectName: '',
            projectRole: '',
            projectRoleName: '',
            isFetching: true,
        };
        this.showError = this.showError.bind(this);
        this.populateProjects = this.populateProjects.bind(this);
        this.populateProjectRoleMap = this.populateProjectRoleMap.bind(this);
    }

    componentDidMount() {
        this.props.getResourceAccessList();
    }

    componentDidUpdate(prevProps) {
        const { resourceAccessList } = this.props;
        if (prevProps && prevProps.resourceAccessList !== resourceAccessList) {
            let projects = this.populateProjects();
            this.populateProjectRoleMap(projects);
        }
    }

    showError(errorMessage) {
        this.setState((prevState) => ({
            ...prevState,
            showError: true,
            errorMessage: errorMessage,
        }));
    }

    populateProjects() {
        const { resourceAccessList, isAdmin, projectDomainName } = this.props;
        let projects = [];
        if (resourceAccessList.resources) {
            resourceAccessList.resources.forEach(function (resources) {
                resources.assertions.forEach(function (assertion) {
                    if (assertion.role.toLowerCase().indexOf('admin') > -1) {
                        if (isAdmin) {
                            projects.push(assertion.role);
                        }
                    } else if (!isAdmin) {
                        projects.push(assertion.role);
                    }
                });
                // filter project list if projectDomainName is specified in the query
                if (projectDomainName) {
                    projects = projects.filter(
                        (project) => project.indexOf(projectDomainName) > -1
                    );
                }
            });
        }
        return projects;
    }

    populateProjectRoleMap(projects) {
        let projectRoleMap = {};
        projects.forEach((projectId) => {
            let projectNameAndRole = projectId.split(':');
            let projectName =
                projectNameAndRole.length > 1 ? projectNameAndRole[0] : '';
            let projectRoleName =
                projectNameAndRole.length > 1
                    ? projectNameAndRole[1].replace('role.', '')
                    : '';
            let projectObject = {
                projectId,
                projectRoleName,
                projectName,
            };
            if (!projectRoleMap[projectName]) {
                projectRoleMap[projectName] = [projectObject];
            } else {
                projectRoleMap[projectName].push(projectObject);
            }
        });
        this.setState((prevState) => ({
            ...prevState,
            projectRoleMap,
            isFetching: false,
        }));
    }

    handleRadioButton(projectObject) {
        this.setState((prevState) => ({
            ...prevState,
            projectRole: projectObject.projectId,
            projectRoleName: projectObject.projectRoleName,
            projectName: projectObject.projectName,
        }));
    }

    render() {
        if (this.props.reload) {
            window.location.reload();
            return <div />;
        }
        if (this.props.error) {
            return <Error err={this.props.error} />;
        }
        if (this.state.isFetching) {
            return <ReduxPageLoader message={'Loading resource access list'} />;
        }
        let displayProjects = [];
        for (let pName in this.state.projectRoleMap) {
            let projectRoleNames = [];
            this.state.projectRoleMap[pName].forEach((projectObject, index) => {
                projectRoleNames.push(
                    <div key={index}>
                        <RadioButton
                            type={'radio'}
                            key={'button-' + projectObject.projectId}
                            value={projectObject.projectId}
                            name={'project'}
                            checked={
                                this.state.projectRole ===
                                projectObject.projectId
                            }
                            onChange={() =>
                                this.handleRadioButton(projectObject)
                            }
                            required={true}
                        />
                        <ProjectLabel key={'label-' + projectObject.projectId}>
                            {projectObject.projectRoleName}
                        </ProjectLabel>
                    </div>
                );
            });

            displayProjects.push(
                <div>
                    <ProjectTitleDiv key={'project-name-' + pName}>
                        Project: {pName}
                    </ProjectTitleDiv>
                    <RadioButtonsContainer
                        key={'radio-button-container-' + pName}
                    >
                        {projectRoleNames}
                    </RadioButtonsContainer>
                </div>
            );
        }

        if (!displayProjects.length) {
            return (
                <CacheProvider value={this.cache}>
                    <div data-testid='gcp-login-error'>
                        <GcpHeader>
                            <img src='/static/google-cloud.svg'></img>
                        </GcpHeader>
                        <ParentWrapperDiv>
                            <h3>
                                Error: There are no GCP project roles associated
                                with your account.
                            </h3>
                            <p>
                                Check to make sure that your <tt>gcp.*</tt>{' '}
                                roles contain your user.
                                <br />
                                E.g., if your account is 'jdoe', then{' '}
                                <tt>gcp.fed.admin.user</tt> should have{' '}
                                <tt>user.jdoe</tt> as a member.
                            </p>
                            <p>
                                If that does not work, please ask your Athenz
                                domain admin for assistance.
                            </p>
                        </ParentWrapperDiv>
                    </div>
                </CacheProvider>
            );
        }

        return (
            <CacheProvider value={this.cache}>
                <div data-testid='gcp-login'>
                    <GcpHeader>
                        <img src='/static/google-cloud.svg'></img>
                    </GcpHeader>
                    <ParentWrapperDiv>
                        <form action='/gcp/login/post' method='post'>
                            <input
                                type='hidden'
                                name='_csrf'
                                value={this.props._csrf}
                            ></input>
                            <input
                                type='hidden'
                                name='isAdmin'
                                value={this.props.isAdmin}
                            ></input>
                            <StyledP>Select a role:</StyledP>
                            {displayProjects}
                            <SubmitContainer>
                                <Button type={'submit'}>Submit</Button>
                            </SubmitContainer>
                        </form>
                    </ParentWrapperDiv>
                </div>
            </CacheProvider>
        );
    }
}

const mapStateToProps = (state, props) => {
    return {
        ...props,
        isLoading: selectIsLoading(state),
        resourceAccessList: selectUserResourceAccessList(state),
    };
};

const mapDispatchToProps = (dispatch) => ({
    getResourceAccessList: () => dispatch(getUserResourceAccessList()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GCPLoginPage);
