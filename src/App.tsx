import React, { useState } from "react";
import Absensi from "./page/absensi";
import "./App.css";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, message, Form, Input, Card } from "antd";
import dayjs from "dayjs";

function App() {
  const [logged, setLogged] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [idKaryawan, setIdKaryawan] = useState(0);

  const [idLokasi, setIdLokasi] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [statusAbsen, setStatusAbsen] = useState([]);
  const shiftKaryawanURL = "https://internal.gbssecurindo.co.id/shiftkaryawan";

  const dateFormat = "YYYY-MM-DD";

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Username atau Password salah!",
    });
  };

  const onFinish = async (values: any) => {
    setLoadingLogin(true);
    try {
      const response = await fetch(
        `https://internal.gbssecurindo.co.id/login?username=${values.username}&password=${values.password}`
      ); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();
      if (result.valid) {
        setLogged(true);
        setIdKaryawan(result.id_karyawan);
        setStatusAbsen(result.status_absen);
        setIdLokasi(result.id_lokasi);
      } else {
        setLogged(false);
        error();
      }
      setLoadingLogin(false);
    } catch (err) {
      console.log("Error fetching data:", err);
      error();
      setLoadingLogin(false);
    }
  };

  return (
    <>
      {contextHolder}
      {!logged ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Card
            style={{ width: 500 }}
            title={
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Absensi GBS
              </span>
            }
          >
            <Form
              name="normal_login"
              className="login-form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your Username!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                  loading={loadingLogin}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Card>
            <Absensi
              id_karyawan={idKaryawan}
              status_absen={statusAbsen}
              id_lokasi={idLokasi}
            />
          </Card>
        </div>
      )}
    </>
  );
}

export default App;
