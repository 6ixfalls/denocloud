import React from "react";
import PropTypes, { any, InferProps } from "prop-types";
import { Link } from "react-router-dom";
import { Typography, Tabs, Card, Loading, Badge } from "@supabase/ui";
import axios from "axios";

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

type ProjectData = {
    name: string,
    loading?: boolean,
    state?: keyof typeof ProjectState,
}

class Cards extends React.Component<{}, { projects: Array<ProjectData> }> {
    constructor(props: CardsTypes) {
        super(props);
        this.state = {
            projects: [{ name: "Loading Projects", loading: true }],
        };
    }

    async componentDidMount() {
        const session = globalThis.supabaseClient.auth.session();
        const data = await axios.get("http://localhost:80/projects/list", {
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
                {this.state.projects.map((project: ProjectData) => (
                    <div key={project.name + "wrapper"}>
                        {project.loading
                            ? <Loading key={project.name} active><Card className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a]`} title="Loading Projects"></Card></Loading>
                            : <Link to={"/dashboard/" + project.name} key={project.name + "container"}>
                                <Card key={project.name + "card"} className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a]`} title={project.name} titleExtra={<Badge color={StateColors.get(ProjectState[project.state || "UNKNOWN"])} size="large" dot>{ProjectState[project.state || "UNKNOWN"]}</Badge>} hoverable>
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