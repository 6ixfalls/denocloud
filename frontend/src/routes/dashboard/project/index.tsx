import { Typography, Card, Button } from "@supabase/ui";
import { ProjectState, BadgeColor, StateColors } from "../index";
import { buildChartTheme, Axis, Grid, LineSeries, Tooltip, XYChart, TooltipProvider } from "@visx/xychart";
import { ParentSize } from "@visx/responsive";
import { appleStock } from '@visx/mock-data';
import { Text as TextVisx } from "@visx/text";
import { Link } from "react-router-dom";

const { Text } = Typography;

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

export default function ProjectIndex() {
    return (
        <div>
            <Button size="medium" className="mt-3 mr-10 float-right"><Link to="editor">Edit</Link></Button>
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
                                        <LineSeries dataKey="data" data={data} {...accessors} />
                                        <Tooltip
                                            snapTooltipToDatumX
                                            snapTooltipToDatumY
                                            showVerticalCrosshair
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
                                        <LineSeries dataKey="data" data={data} {...accessors} />
                                        <Tooltip
                                            snapTooltipToDatumX
                                            snapTooltipToDatumY
                                            showVerticalCrosshair
                                            showDatumGlyph
                                            unstyled
                                            applyPositionStyle
                                            renderTooltip={({ tooltipData }) => (
                                                <div className="text-white text-sm p-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded">
                                                    <span className="font-bold">{accessors.xAccessor(tooltipData?.nearestDatum?.datum).toLocaleString("en-US", { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                                    <br />
                                                    {accessors.yAccessor(tooltipData?.nearestDatum?.datum) + " Errors"}
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
                                        <LineSeries dataKey="data" data={data} {...accessors} />
                                        <Tooltip
                                            snapTooltipToDatumX
                                            snapTooltipToDatumY
                                            showVerticalCrosshair
                                            showDatumGlyph
                                            unstyled
                                            applyPositionStyle
                                            renderTooltip={({ tooltipData }) => (
                                                <div className="text-white text-sm p-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded">
                                                    <span className="font-bold">{accessors.xAccessor(tooltipData?.nearestDatum?.datum).toLocaleString("en-US", { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                                    <br />
                                                    {accessors.yAccessor(tooltipData?.nearestDatum?.datum) + " ms"}
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
        </div>
    );
}