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
            jam_masuk: item.jam_masuk,
            jam_keluar: item.jam_keluar,
          };
        });
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
    const currentDate = new Date(); // Get the current date and time

    for (const entry of data) {
      const startDate = new Date(entry.start_date);
      const endDate = new Date(entry.end_date);

      // Check if the current date falls within the date range
      if (currentDate >= startDate && currentDate <= endDate) {
        // Extract hours, minutes, and seconds from jam_masuk and jam_keluar
        const [jamMasukHours, jamMasukMinutes, jamMasukSeconds] =
          entry.jam_masuk.split(":").map(Number);
        const [jamKeluarHours, jamKeluarMinutes, jamKeluarSeconds] =
          entry.jam_keluar.split(":").map(Number);

        // Check if the current time is between jam_masuk and jam_keluar
        const currentHours = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();
        const currentSeconds = currentDate.getSeconds();

        if (
          (currentHours > jamMasukHours ||
            (currentHours === jamMasukHours &&
              currentMinutes >= jamMasukMinutes &&
              currentSeconds >= jamMasukSeconds)) &&
          (currentHours < jamKeluarHours ||
            (currentHours === jamKeluarHours &&
              currentMinutes <= jamKeluarMinutes &&
              currentSeconds <= jamKeluarSeconds))
        ) {
          return entry.id_shift; // Return the id_shift if the date and time match
        }
      }
    }

    return null; // Return null if no matching date and time range is found for today
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
