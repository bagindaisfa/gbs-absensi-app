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
  const [idShift, setIdShift] = useState(0);
  const [idLokasi, setIdLokasi] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [statusAbsen, setStatusAbsen] = useState([]);
  const shiftKaryawanURL = "http://localhost:3001/shiftkaryawan";
  const [shiftKaryawanList, setShiftKaryawanList] = useState([]);
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
        `http://localhost:3001/login?username=${values.username}&password=${values.password}`
      ); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();
      console.log("result :", result);
      if (result.valid) {
        setLogged(true);
        setIdKaryawan(result.id_karyawan);
        setStatusAbsen(result.status_absen);
        getKaryawan(result.id_karyawan, result.id_lokasi);
        setIdLokasi(result.id_lokasi);
      } else {
        setLogged(false);
        error();
        setLoadingLogin(false);
      }
    } catch (err) {
      console.log("Error fetching data:", err);
      error();
      setLoadingLogin(false);
    }
  };

  const getKaryawan = async (id_karyawan: number, id_lokasi: number) => {
    try {
      const response = await fetch(
        shiftKaryawanURL +
          "?id_karyawan=" +
          id_karyawan +
          "&id_lokasi=" +
          id_lokasi
      ); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();
      if (result) {
        const data_shift = result.shiftkaryawan.map((item: any) => {
          return {
            id: item.id,
            id_shift: item.id_shift,
            id_lokasi: item.id_lokasi,
            id_karyawan: item.id_karyawan,
            start_date: dayjs(item.start_date).format(dateFormat),
            end_date: dayjs(item.end_date).format(dateFormat),
          };
        });
        setShiftKaryawanList(data_shift);
        const id_shift = await getIdShiftForToday(data_shift);
        setIdShift(id_shift);
      }
      setLoadingLogin(false);
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoadingLogin(false);
    }
  };

  const getIdShiftForToday = (data: any) => {
    const currentDate = new Date(); // Get the current date
    currentDate.setHours(7);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    for (const entry of data) {
      const startDate = new Date(entry.start_date);
      const endDate = new Date(entry.end_date);

      // Check if the current date falls within the date range
      if (currentDate >= startDate && currentDate <= endDate) {
        return entry.id_shift; // Return the id_shift if the date matches
      }
    }

    return null; // Return null if no matching date range is found for today
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
              id_shift={idShift}
              id_lokasi={idLokasi}
            />
          </Card>
        </div>
      )}
    </>
  );
}

export default App;
