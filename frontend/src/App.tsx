import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import { Typography, Button, Form, Input } from '@supabase/ui';
import { UserProvider, useUser } from "@supabase/auth-helpers-react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as Yup from 'yup';
import axios from 'axios';
import Toast from "./components/Toast";

const { Text } = Typography;

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_ANON_KEY || ""
);

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
})

const ContainerPropTypes = {
  children: PropTypes.element.isRequired,
  supabaseClient: SupabaseClient,
  className: PropTypes.string,
}

type ContainerTypes = InferProps<typeof ContainerPropTypes>;
const Container = (props: ContainerTypes) => {
  const { user } = useUser();
  if (user)
    return (
      <>
        <Text>Signed in: {user.email}</Text>
        <Button block onClick={() => props.supabaseClient.auth.signOut()}>
          Sign out
        </Button>
      </>
    );
  return props.children;
}

function App() {
  return (
    <UserProvider supabaseClient={supabase}>
      <Container supabaseClient={supabase}>
        <Form
          initialValues={{
            email: '',
            password: ''
          }}
          validationSchema={SignupSchema}
          onSubmit={(values: any, { setSubmitting }: any) => {
            Toast.toast("Success", {type: "success", duration: 1000000});
            Toast.toast("Error", {type: "error", duration: 1000000});
            Toast.toast("Loading", {type: "loading", duration: 1000000});
            Toast.toast("??", {duration: 1000000});
            setSubmitting(false);
            axios({
              method: 'post',
              url: process.env.PUBLIC_URL + '/auth/login',
              data: values,
            }).then(res => {
              Toast.toast("Success", {type: "success"});
            }).catch(e => {

            });
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
    </UserProvider>
  );
}

export default App;
