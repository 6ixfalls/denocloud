import PropTypes, { InferProps } from "prop-types";
import { Outlet } from "react-router-dom";
import { Typography, Tabs, Card } from "@supabase/ui";

const { Text } = Typography;

const CardPropTypes = {
    className: PropTypes.string,
    key: PropTypes.number,
}

type CardTypes = InferProps<typeof CardPropTypes>;

const ProjectCard = (props: CardTypes) => {
    return (
        <Card className={`card ${props.className || ''}`} title="Test" titleExtra={<Text>a</Text>} hoverable>
        </Card>
    );
};

export default function Dashboard() {
    return (
        <div>
            <Text>DenoCloud Dashboard</Text>
            <Tabs defaultActiveId="projects" type="underlined">
                <Tabs.Panel id="projects" label="Projects">
                    {[...Array(10)].map((x, i) =>
                        <ProjectCard key={i} />
                    )}
                </Tabs.Panel>
                <Tabs.Panel id="test" label="Test">

                </Tabs.Panel>
            </Tabs>
        </div>
    );
}