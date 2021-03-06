import { Typography, Card, Button, Loading } from "@supabase/ui";
import Input from "../../../components/Form/Input";
import Form from "../../../components/Form/Form";
import { buildChartTheme, Axis, Grid, Tooltip, XYChart, TooltipProvider, AreaSeries } from "@visx/xychart";
import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import { appleStock } from '@visx/mock-data';
import { Link, useParams } from "react-router-dom";
import * as yup from "yup";
import { supabaseClient } from "../../..";
import Toast from "../../../components/Toast";
import KeyValue from "../../../components/KeyValue";
import React from "react";

const TLDRegex = new RegExp(/^(?=.{1,253}\.?$)(?:(?!-|[^.]+_)[A-Za-z0-9-_]{1,63}(?<!-)(?:\.|$)){2,}$/gim);

yup.addMethod(yup.array, 'unique', function (
    mapper = (a: any) => a,
    // eslint-disable-next-line
    message: string = '${path} may not have duplicates'
) {
    return this.test('unique', message, (list: any) => {
        return list.length === new Set(list.map(mapper)).size;
    });
});

yup.addMethod<yup.StringSchema>(yup.string, "tld", function (message = "Invalid Domain (Valid Formats: google.com, github.com, store.lunarclient.com)") {
    return this.matches(TLDRegex, {
        name: 'tld',
        message,
        excludeEmptyString: true,
    });
});

const { Text } = Typography;

const SettingsSchema = yup.object().shape({
    domain: yup.string().tld(),
    env: yup.array().of(
        yup.object().shape({
            key: yup.string(),
            value: yup.string()
        })
    ).unique((a: any) => a.key)
})

const data = appleStock.slice(1250);

const accessors = {
    xAccessor: (d: any) => new Date(d.date),
    yAccessor: (d: any) => d.close,
}

const theme = buildChartTheme({
    backgroundColor: "transparent",
    colors: ["#65d9a5"],
    tickLength: 4,
    gridColor: "#2a2a2a",
    gridColorDark: "#2a2a2a",
    xAxisLineStyles: {
        stroke: "#2a2a2a",
    },
    yAxisLineStyles: {
        stroke: "#2a2a2a",
    },
    xTickLineStyles: {
        stroke: "#2a2a2a",
    },
    yTickLineStyles: {
        stroke: "#2a2a2a",
    }
});

class ProjectIndex extends React.Component<{ project: string }, { settings: any, loadingSettings: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = {
            settings: { domain: "", env: [] },
            loadingSettings: true,
        }
    }

    async componentDidMount() {
        const { data, error } = await supabaseClient.from("worker_settings").select("domain,env").eq("name", this.props.project).single();
        if (!error) {
            data.domain = data.domain[0] || "";
            this.setState({ settings: data, loadingSettings: false });
        } else {
            this.setState({ loadingSettings: false });
        }
    }

    render() {
        const { settings, loadingSettings } = this.state;

        return (
            <Loading active={loadingSettings}>
                <div className="w-full flex flex-row-reverse mt-3 right-5 absolute top-0 pointer-events-none">
                    <Button size="medium" className="mt-3 mr-10 float-right pointer-events-auto"><Link to="editor">Edit</Link></Button>
                </div>
                <div className="columns-3 w-full py-5 px-10 h-auto">
                    <Card className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a] flex-col-reverse`} cover={
                        <div className="p-5 pt-0 h-[40vh]">
                            <ParentSize>
                                {(parent) => {
                                    return (<TooltipProvider hideTooltipDebounceMs={0}>
                                        <XYChart height={parent.height} width={parent.width} xScale={{ type: 'time' }} yScale={{ type: 'linear' }} theme={theme}>
                                            <Axis orientation="left" numTicks={5} />
                                            <Axis orientation="bottom" />
                                            <Grid />
                                            <LinearGradient id="gradient" from="#65d9a5" to="#65d9a5" fromOpacity={0.7} toOpacity={0.1} />
                                            <AreaSeries dataKey="data" fill="url(#gradient)" data={data} {...accessors} />
                                            <Tooltip
                                                snapTooltipToDatumX
                                                snapTooltipToDatumY
                                                showVerticalCrosshair
                                                verticalCrosshairStyle={{ stroke: "#ccc", strokeWidth: "1px", opacity: 1 }}
                                                showDatumGlyph
                                                unstyled
                                                applyPositionStyle
                                                renderTooltip={({ tooltipData }) => (
                                                    <div className="text-white text-sm p-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded">
                                                        <span className="font-bold">{accessors.xAccessor(tooltipData?.nearestDatum?.datum).toLocaleString("en-US", { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                                        <br />
                                                        {accessors.yAccessor(tooltipData?.nearestDatum?.datum) + " Requests"}
                                                    </div>
                                                )}
                                            />
                                        </XYChart>
                                    </TooltipProvider>)
                                }}
                            </ParentSize>
                        </div>
                    }>
                        <span className="font-normal text-gray-1100"><Text>Requests</Text><br /></span>
                        <span className="font-bold text-lg"><Text>12</Text></span>
                    </Card>
                    <Card className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a] flex-col-reverse`} cover={
                        <div className="p-5 pt-0 h-[40vh]">
                            <ParentSize>
                                {(parent) => {
                                    return (<TooltipProvider hideTooltipDebounceMs={0}>
                                        <XYChart height={parent.height} width={parent.width} xScale={{ type: 'time' }} yScale={{ type: 'linear' }} theme={theme}>
                                            <Axis orientation="left" numTicks={5} />
                                            <Axis orientation="bottom" />
                                            <Grid />
                                            <LinearGradient id="gradient" from="#65d9a5" to="#65d9a5" fromOpacity={0.7} toOpacity={0.1} />
                                            <AreaSeries dataKey="data" fill="url(#gradient)" data={data} {...accessors} />
                                            <Tooltip
                                                snapTooltipToDatumX
                                                snapTooltipToDatumY
                                                showVerticalCrosshair
                                                verticalCrosshairStyle={{ stroke: "#ccc", strokeWidth: "1px", opacity: 1 }}
                                                showDatumGlyph
                                                unstyled
                                                applyPositionStyle
                                                renderTooltip={({ tooltipData }) => (
                                                    <div className="text-white text-sm p-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded">
                                                        <span className="font-bold">{accessors.xAccessor(tooltipData?.nearestDatum?.datum).toLocaleString("en-US", { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                                        <br />
                                                        {accessors.yAccessor(tooltipData?.nearestDatum?.datum) + " Requests"}
                                                    </div>
                                                )}
                                            />
                                        </XYChart>
                                    </TooltipProvider>)
                                }}
                            </ParentSize>
                        </div>
                    }>
                        <span className="font-normal text-gray-1100"><Text>Errors</Text><br /></span>
                        <span className="font-bold text-lg"><Text>12</Text></span>
                    </Card>
                    <Card className={`card bg-[#1f1f1f] mb-2 border-[#2a2a2a] flex-col-reverse`} cover={
                        <div className="p-5 pt-0 h-[40vh]">
                            <ParentSize>
                                {(parent) => {
                                    return (<TooltipProvider hideTooltipDebounceMs={0}>
                                        <XYChart height={parent.height} width={parent.width} xScale={{ type: 'time' }} yScale={{ type: 'linear' }} theme={theme}>
                                            <Axis orientation="left" numTicks={5} />
                                            <Axis orientation="bottom" />
                                            <Grid />
                                            <LinearGradient id="gradient" from="#65d9a5" to="#65d9a5" fromOpacity={0.7} toOpacity={0.1} />
                                            <AreaSeries dataKey="data" fill="url(#gradient)" data={data} {...accessors} />
                                            <Tooltip
                                                snapTooltipToDatumX
                                                snapTooltipToDatumY
                                                showVerticalCrosshair
                                                verticalCrosshairStyle={{ stroke: "#ccc", strokeWidth: "1px", opacity: 1 }}
                                                showDatumGlyph
                                                unstyled
                                                applyPositionStyle
                                                renderTooltip={({ tooltipData }) => (
                                                    <div className="text-white text-sm p-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded">
                                                        <span className="font-bold">{accessors.xAccessor(tooltipData?.nearestDatum?.datum).toLocaleString("en-US", { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                                        <br />
                                                        {accessors.yAccessor(tooltipData?.nearestDatum?.datum) + " Requests"}
                                                    </div>
                                                )}
                                            />
                                        </XYChart>
                                    </TooltipProvider>)
                                }}
                            </ParentSize>
                        </div>
                    }>
                        <span className="font-normal text-gray-1100"><Text>Average Response Time (ms)</Text><br /></span>
                        <span className="font-bold text-lg"><Text>12 ms</Text></span>
                    </Card>
                </div>
                <Form
                    initialValues={settings}
                    validationSchema={SettingsSchema}
                    onSubmit={async (values: any, { setSubmitting }: any) => {
                        const { error } = await supabaseClient.from("worker_settings").update({ domain: [values.domain], env: values.env }).eq("name", this.props.project);
                        if (error) {
                            Toast.toast(error.message, { type: "error" });
                        } else {
                            Toast.toast("Domain updated", { type: "success" });
                        }
                    }}
                    enableReinitialize
                >
                    {({ isSubmitting }: any) => (
                        <div className="px-10">
                            <span className="font-bold text-lg"><Text>Settings</Text></span>
                            <span className="font-normal text-base"><Input id="domain" name="domain" label="Domain" layout="vertical" placeholder="example.com" autoComplete="off" /></span>
                            {/*<MultiSelect
                                options={options}
                                value={value}
                                placeholder="example.com"
                                label={"Domains"}
                                searchPlaceholder="Search for domain"
                                emptyMessageGenerator={(text: string) => {
                                    if (text.match(TLDRegex)) {
                                        return (
                                            <div
                                                onClick={() => {
                                                    setOptions([...options, { name: text, value: text, id: text, disabled: false }]);
                                                }}
                                                className={[
                                                    'text-scale-1100 font-medium',
                                                    'flex cursor-pointer items-center justify-between transition',
                                                    'space-x-1 rounded bg-transparent p-2 px-4 text-sm hover:bg-gray-600',
                                                ].join(' ')}
                                            >
                                                <span className="font-normal">Add <span className="font-medium">{text}</span>...</span>
                                            </div>
                                        )
                                    } else {
                                        return (<></>)
                                    }
                                }}
                            />*/}
                            <span className="font-normal text-scale-1100 text-sm"><Text>Environment Variables</Text></span>
                            <KeyValue labelKey="Parameter" labelValue="Value" valueKey="env" />
                            <Button loading={isSubmitting} type="primary" htmlType="submit" className="mt-5">
                                Save Changes
                            </Button>
                        </div>
                    )}
                </Form>
            </Loading>
        );
    }
}

export default function Project() {
    return (
        <ProjectIndex project={useParams().project || ""} />
    );
}