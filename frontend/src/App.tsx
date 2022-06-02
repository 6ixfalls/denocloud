import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import { Typography, Button, Form, Input } from '@supabase/ui';
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as Yup from 'yup';
import Toast from "./components/Toast";

const { Text } = Typography;

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_ANON_KEY || ""
);

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid Email').required('Required'),
  password: Yup.string().min(6, '6 Characters Minimum').required('Required'),
})

const ContainerPropTypes = {
  children: PropTypes.element.isRequired,
  supabaseClient: SupabaseClient,
  className: PropTypes.string,
}

type ContainerTypes = InferProps<typeof ContainerPropTypes>;
const Container = (props: ContainerTypes) => {
  const user = supabase.auth.user();
  console.log(user);
  if (user)
    return (
      <>
        <Text>Signed in: {user.email}</Text>
        <Button block onClick={() => {props.supabaseClient.auth.signOut(); window.location.reload();}}>
          Sign out
        </Button>
      </>
    );
  return props.children;
}

function App() {
  return (
      <Container supabaseClient={supabase}>
        <Form
          initialValues={{
            email: '',
            password: ''
          }}
          validationSchema={SignupSchema}
          onSubmit={async (values: any, { setSubmitting }: any) => {
            const { error: signInError } = await supabase.auth.signIn({
              email: values.email,
              password: values.password
            }, {});
            if (signInError)
              Toast.toast(signInError.message, {type: "error"});
            else {
              Toast.toast("Signed in", {type: "success"});
              window.location.reload();
            }
            setSubmitting(false);
          }}
          className="w-full h-screen relative flex flex-col items-center justify-center mx-auto text-gray-50"
        >
          {({ isSubmitting }: any) => (
            <div className="w-1/2 space-y-4">
              <span className="font-medium"><Text>DenoCloud</Text></span>
              <Input
                id="email"
                name="email"
                label="Email"
                placeholder="Email"
                autoComplete="off"
              />
              <Input
                id="password"
                name="password"
                label="Password"
                placeholder="Password"
                autoComplete="off"
                type="password"
              />
              <Button loading={isSubmitting} type="primary" htmlType="submit">
                Login
              </Button>
            </div>
          )}
        </Form>
      </Container>
  );
}

export default App;
