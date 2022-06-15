import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Form, Input, Button } from "@supabase/ui";
import Upload from "../../../components/Upload";
import * as yup from "yup";
import { supabaseClient } from '../../../index';
import Toast from "../../../components/Toast";

const TLDRegex = new RegExp(/^(?=.{1,253}\.?$)(?:(?!-|[^.]+_)[A-Za-z0-9-_]{1,63}(?<!-)(?:\.|$)){2,}$/gim);

yup.addMethod<yup.StringSchema>(yup.string, "tld", function (message = "Invalid Domain (Valid Formats: google.com, github.com, store.lunarclient.com)") {
    return this.matches(TLDRegex, {
        name: 'tld',
        message,
        excludeEmptyString: true,
    });
});

const { Text } = Typography;

const ProjectSchema = yup.object().shape({
    name: yup.string().required("A project name is required"),
    domain: yup.string().tld("Invalid Domain (Valid Formats: google.com, github.com, store.lunarclient.com)"),
});

export default function Project() {
    let [file, setFile] = React.useState<File>();
    let navigate = useNavigate();

    return (
        <div>
            <Form
                initialValues={{
                    name: '',
                    domain: ''
                }}
                validationSchema={ProjectSchema}
                onSubmit={async (values: any, { setSubmitting }: any) => {
                    if (!file)
                        file = new File([`console.log("Welcome to DenoCloud!");`], "worker.js", { type: "text/javascript" });
                    const { error } = await supabaseClient.storage.from("worker-storage").upload(supabaseClient.auth.user()?.id + "/" + values.name + ".js", file);

                    if (error) {
                        Toast.toast(error.message);
                    } else {
                        const { error: insertError } = await supabaseClient.from("workers").insert({
                            owner: supabaseClient.auth.user()?.id,
                            name: values.name,
                            domain: values.domain
                        }, { returning: "minimal" });

                        if (insertError)
                            return Toast.toast(insertError.message);

                        Toast.toast("Project created successfully");
                        setTimeout(() => {
                            navigate(`/dashboard/projects/${encodeURIComponent(values.name)}`, { replace: true });
                        });
                    }
                }}
            >
                {({ isSubmitting }: any) => (
                    <div className="px-10 pt-5">
                        <span className="font-bold text-lg"><Text>New Project</Text></span>
                        <span className="font-normal text-base">
                            <Input id="name" name="name" label="Name" layout="vertical" placeholder="Project Name" autoComplete="off" className="my-2" />
                            <Input id="domain" name="domain" label="Domain (Optional)" layout="vertical" placeholder="example.com" autoComplete="off" className="my-2" />
                        </span>
                        <span className="text-sm font-normal space-x-2 justify-between col-span-12 block text-scale-1100 cursor-default" title="If a file isn't uploaded, a template will be filled in.">
                            <Text>Project File (Optional)</Text>
                        </span>
                        <Upload.Dragger
                            layout="horizontal"
                            files={file}
                            setFile={setFile}
                            className="!max-w-none font-normal"
                            title="If a file isn't uploaded, a template will be filled in."
                        >
                            <div className="flex flex-col gap-8 justify-evenly">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-1100"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-1100">
                                        <Typography.Text className="m-auto text-center">
                                            <span className="text-[#3ecf8e] font-normal underline">
                                                <Typography.Link
                                                    style={{
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    Upload a file
                                                </Typography.Link>
                                            </span>

                                            {' or drag and drop'}
                                        </Typography.Text>
                                    </div>

                                    <p className="text-xs text-gray-900">JS up to 50MB</p>
                                    <p className="text-xs font-medium text-gray-1200">{file?.name}</p>
                                </div>
                            </div>
                        </Upload.Dragger>
                        <Button loading={isSubmitting} type="primary" htmlType="submit" className="mt-5">
                            Create
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
}