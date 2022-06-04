import React from "react";
import PropTypes, { any, InferProps } from "prop-types";
import { Outlet } from "react-router-dom";
import { Typography, Tabs, Card, Loading } from "@supabase/ui";
import axios from "axios";

const { Text, Link } = Typography;

const CardsPropTypes = {
    className: PropTypes.string,
    key: PropTypes.number,
    items: PropTypes.any,
}

type CardsTypes = InferProps<typeof CardsPropTypes>;

type ProjectData = {
    name: string,
    loading?: boolean,
}

class Cards extends React.Component<{}, {projects: Array<ProjectData>}> {
    constructor(props: CardsTypes) {
        super(props);
        this.state = {
            projects: [{name: "Loading Projects", loading: true}],
        };
    }

    async componentDidMount() {
        const session = globalThis.supabaseClient.auth.session();
        const data = await axios.get("http://localhost:80/projects/list", {
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            }
        });
        setTimeout(() => {
            this.setState({projects: data.data});
        }, 1000);
        
    }

//     <span className="text-[#3ecf8e] font-normal underline"><Link href="/dashboard/editor" target="_self">dir</Link></span>

    render() {
        return (
            <div>
                {this.state.projects.map((project: ProjectData) => (
                    <a href={"/dashboard/" + project.name} key={project.name + "container"}>
                        { project.loading
                            ? <Loading key={project.name} active><Card className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a]`} title="Loading Projects"></Card></Loading>
                            : <Card key={project.name + "card"} className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a]`} title={project.name} hoverable>
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
                        }
                    </a>
                ))}
            </div>
        )
    }
}

export default function Dashboard() {
    return (
        <div>
            <Text>DenoCloud Dashboard</Text>
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