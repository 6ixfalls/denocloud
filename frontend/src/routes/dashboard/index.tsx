import React from "react";
import PropTypes, { InferProps } from "prop-types";
import { Link } from "react-router-dom";
import { Typography, Tabs, Card, Loading, Button } from "@supabase/ui";
import axios from "axios";
import { supabaseClient } from '../../index';
import Badge from "../../components/Badge";

const { Text } = Typography;

const CardsPropTypes = {
    className: PropTypes.string,
    key: PropTypes.number,
    items: PropTypes.any,
}

type CardsTypes = InferProps<typeof CardsPropTypes>;

export enum ProjectState {
    RUNNING = "Running",
    STOPPED = "Stopped",
    STARTING = "Starting",
    FAILED = "Failed",
    UNKNOWN = "Unknown",
}

export type BadgeColor = 'brand' | 'scale' | 'tomato' | 'red' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'green' | 'grass' | 'brown' | 'orange' | 'sky' | 'mint' | 'lime' | 'yellow' | 'amber' | 'gold' | 'bronze' | 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand';

export const StateColors = new Map<ProjectState, BadgeColor>([
    [ProjectState.RUNNING, "brand"],
    [ProjectState.STOPPED, "red"],
    [ProjectState.STARTING, "yellow"],
    [ProjectState.FAILED, "red"],
    [ProjectState.UNKNOWN, "gray"],
]);

export const DotStates: Array<ProjectState> = [
    ProjectState.RUNNING,
    ProjectState.STARTING,
];

type ProjectData = {
    name: string,
    loading?: boolean,
    status?: ProjectState,
}

class Cards extends React.Component<{}, { projects: Array<ProjectData> }> {
    constructor(props: CardsTypes) {
        super(props);
        this.state = {
            projects: [{ name: "Loading Projects", loading: true }],
        };
    }

    async componentDidMount() {
        const session = supabaseClient.auth.session();
        const data = await axios.get(`${window.location.origin}/projects/list`, {
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            }
        });
        this.setState({ projects: data.data });
    }

    //     <span className="text-[#3ecf8e] font-normal underline"><Link href="/dashboard/editor" target="_self">dir</Link></span>

    render() {
        return (
            <div>
                <div className="w-full flex flex-row-reverse mt-3 right-5 absolute top-0 pointer-events-none">
                    <Button size="medium" className="mt-3 mr-10 float-right pointer-events-auto"><Link to="create">Create New</Link></Button>
                </div>
                {this.state.projects.map((project: ProjectData) => (
                    <div key={project.name + "wrapper"}>
                        {project.loading
                            ? <Loading key={project.name} active><Card className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a]`} title="Loading Projects"></Card></Loading>
                            : <Link to={"/dashboard/projects/" + project.name} key={project.name + "container"}>
                                <Card key={project.name + "card"} className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a]`} title={project.name} titleExtra={<Badge color={StateColors.get(project.status || ProjectState.UNKNOWN)} size="large" dot={DotStates.includes(project.status || ProjectState.UNKNOWN)}>{project.status || "Unknown"}</Badge>} hoverable>
                                    <div className="flex flex-row">
                                        <div className="flex flex-col mx-7">
                                            <span><Text>Requests</Text></span><span className="font-normal"><Text>10</Text></span>
                                        </div>
                                        <div className="flex flex-col mx-7">
                                            <span><Text>Errors</Text></span><span className="font-normal"><Text>10</Text></span>
                                        </div>
                                        <div className="flex flex-col mx-7">
                                            <span><Text>Avg Response Time (ms)</Text></span><span className="font-normal"><Text>10 ms</Text></span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        }
                    </div>
                ))}
            </div>
        )
    }
}

export default function Dashboard() {
    return (
        <div>
            <Text>Dashboard</Text>
            <Tabs defaultActiveId="projects" type="underlined">
                <Tabs.Panel id="projects" label="Projects">
                    <Cards />
                </Tabs.Panel>
                <Tabs.Panel id="test" label="Test">

                </Tabs.Panel>
            </Tabs>
        </div>
    );
}