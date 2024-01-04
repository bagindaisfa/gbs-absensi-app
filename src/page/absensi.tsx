import React, { useRef, useState } from "react";
import {
  Button,
  Space,
  Input,
  Tag,
  DatePicker,
  message,
  Radio,
  RadioChangeEvent,
  Form,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: "Absensi",
    dataIndex: "name",
    key: "name",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
];

const Absensi = (value: any) => {
  const [form] = Form.useForm();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 as months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const dateFormat = "YYYY-MM-DD";
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [photoData, setPhotoData] = useState<string>("");
  const [takeButton, setTakeButton] = useState(false);
  const [uploadButton, setUploadButton] = useState(false);
  const [getPhoto, setGetPhoto] = useState(false);
  const [status, setStatus] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [idLokasi, setIdLokasi] = useState<any>(0);
  const [lokasiList, setLokasiList] = useState([]);
  const lokasiURL = "https://internal.gbssecurindo.co.id/masterLokasi";

  React.useEffect(() => {
    getLocation();
    getLokasi();
  }, []);

  const error = (message: any) => {
    messageApi.open({
      type: "error",
      content: message,
    });
  };

  let stream: MediaStream | null = null; // Define stream variable

  const onChangeStatus = ({ target: { value } }: RadioChangeEvent) => {
    setStatus(value);
    if (value === "Izin" || value === "Sakit") {
      setUploadButton(true);
    } else {
      setUploadButton(false);
    }
  };

  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const startBackCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" }, // Use 'environment' for back camera
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null; // Reset the stored stream
    }
  };

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photo = canvas.toDataURL("image/jpeg");

        setPhotoData(photo);

        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    }
  };

  const onChangeAlasan = (val: any) => {
    setKeterangan(val.target.value);
  };

  const getLokasi = async () => {
    try {
      const response = await fetch(lokasiURL); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();
      if (result) {
        setLokasiList(result.lokasi);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const onChangeLokasi = (value: number) => {
    setIdLokasi(value);
  };

  function getLocation() {
    if (navigator.geolocation) {
      // Geolocation is supported
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      // Geolocation is not supported
      alert("Geolocation is not supported by this browser.");
    }
  }

  // Function to handle successful retrieval of user's location
  function showPosition(position: any) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLat(latitude);
    setLong(longitude);
  }

  // Function to handle errors in getting user's location
  function showError(error: any) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.");
        break;
      default:
        break;
    }
  }

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const submit = async () => {
    setLoadingSubmit(true);
    let hari_izin: any = [];
    if (status === "Izin" || status === "Sakit") {
      await form
        .validateFields()
        .then(async (values) => {
          hari_izin = values.hari_izin.map((item: any) => {
            return dayjs(item.date).format(dateFormat); // Extract date part in "YYYY-MM-DD" format
          });
        })
        .catch((error) => {
          console.log("error get dates :", error);
          hari_izin = [];
        });
    }

    const base64Image = photoData.replace(
      /^data:image\/(png|jpeg);base64,/,
      ""
    );
    const blob = await fetch(`data:image/jpeg;base64,${base64Image}`).then(
      (res) => res.blob()
    );

    const formData = new FormData();
    formData.append("id_karyawan", value.id_karyawan);

    formData.append("latitude", lat);
    formData.append("longitude", long);
    formData.append("foto", blob);
    formData.append("id_shift", value.id_shift ?? 0);
    formData.append("id_lokasi", value.id_shift ? value.id_lokasi : idLokasi);
    formData.append("hari_izin", JSON.stringify(hari_izin));
    if (status === "Izin" || status === "Sakit") {
      formData.append("status", status);
      formData.append("alasan", keterangan);
    } else {
      formData.append("status", status);
      formData.append("alasan", "");
    }

    try {
      const url = "https://internal.gbssecurindo.co.id/absensi";
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse?.error || "Unknown error occurred.";
        error(errorMessage);
        setLoadingSubmit(false);
      } else {
        // Handle response if needed
        const data = await response.json();
        console.log("Response:", data);
        setGetPhoto(false);
        window.location.reload();
        setLoadingSubmit(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setGetPhoto(false);
      error(err);
      setLoadingSubmit(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <table>
        {getPhoto && (
          <>
            <tr>
              <td style={{ textAlign: "center" }}>
                {!photoData && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", maxWidth: "300px" }}
                  />
                )}
                {photoData && (
                  <img
                    src={photoData}
                    alt="Selfie"
                    style={{ width: "100%", maxWidth: "300px" }}
                  />
                )}

                <canvas ref={canvasRef} style={{ display: "none" }} />
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: "center" }}>
                {takeButton && (
                  <Button
                    onClick={() => {
                      takePhoto();
                      stopCamera();
                      setTakeButton(false);
                    }}
                    style={{ margin: 15 }}
                  >
                    Take Photo
                  </Button>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: "center" }}>
                {!takeButton && (
                  <Button
                    onClick={() => {
                      setPhotoData("");
                      if (
                        uploadButton &&
                        (status === "Sakit" || status === "Izin")
                      ) {
                        startBackCamera();
                      } else {
                        startCamera();
                      }
                      setTakeButton(true);
                    }}
                    style={{ margin: 15 }}
                  >
                    {status === "Izin" || status === "Sakit" ? (
                      <span>Lampiran</span>
                    ) : (
                      <span>Foto Selfie</span>
                    )}
                  </Button>
                )}
              </td>
            </tr>
          </>
        )}
        {!value.id_shift && (
          <>
            <tr>
              <td style={{ textAlign: "center" }}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Pilih lokasi"
                  onChange={onChangeLokasi}
                  allowClear
                  filterOption={filterOption}
                  style={{ minWidth: 300 }}
                >
                  {lokasiList?.map((item: any) => {
                    return (
                      <Option value={item.id} label={item.nama_lokasi}>
                        {item.nama_lokasi}
                      </Option>
                    );
                  })}
                </Select>
              </td>
            </tr>
          </>
        )}
        {!getPhoto && (
          <>
            <tr>
              <td style={{ textAlign: "center" }}>
                <Radio.Group
                  buttonStyle="solid"
                  onChange={onChangeStatus}
                  style={{ margin: 15 }}
                >
                  <Radio.Button
                    value="Hadir"
                    // disabled={
                    //   value.status_absen.some((item: any) =>
                    //     /^Izin/.test(item)
                    //   ) || value.status_absen.includes("Hadir")
                    // }
                  >
                    Hadir
                  </Radio.Button>
                  <Radio.Button
                    value="Pulang"
                    // disabled={
                    //   value.status_absen.some((item: any) =>
                    //     /^Izin/.test(item)
                    //   ) ||
                    //   value.status_absen.includes("Pulang") ||
                    //   value.status_absen.length <= 0
                    // }
                  >
                    Pulang
                  </Radio.Button>
                  <Radio.Button
                    value="Izin"
                    // disabled={value.status_absen.length > 0}
                  >
                    Izin
                  </Radio.Button>
                  <Radio.Button
                    value="Sakit"
                    // disabled={value.status_absen.length > 0}
                  >
                    Sakit
                  </Radio.Button>
                </Radio.Group>
              </td>
            </tr>
          </>
        )}
        {(status === "Izin" || status === "Sakit") && (
          <>
            <tr>
              <td style={{ textAlign: "center", marginBottom: 10 }}>
                <TextArea rows={4} onChange={onChangeAlasan} />
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: "center" }}>
                <Form
                  name="dynamic_form_nest_item"
                  style={{ maxWidth: 600 }}
                  form={form}
                >
                  <Form.List name="hari_izin">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space
                            key={key}
                            style={{ display: "flex" }}
                            align="baseline"
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "date"]}
                              rules={[
                                { required: true, message: "Missing date" },
                              ]}
                            >
                              <DatePicker
                                placeholder="Pilih hari"
                                style={{ minWidth: 270 }}
                                format={dateFormat}
                              />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Tambah Hari
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form>
              </td>
            </tr>
          </>
        )}
        <tr>
          <td style={{ textAlign: "center" }}>
            <Button
              type="primary"
              style={{ margin: 15 }}
              onClick={() => {
                if (status === "") {
                  error("Pilih absen dahulu!");
                } else {
                  if (getPhoto) {
                    submit();
                  } else {
                    setGetPhoto(true);
                  }
                }
              }}
              disabled={
                value.status_absen.some((item: any) => /^Izin/.test(item)) ||
                value.status_absen.length >= 2 ||
                (getPhoto && !photoData)
              }
              loading={loadingSubmit}
            >
              {getPhoto ? <span>Simpan</span> : <span>Ambil Foto</span>}
            </Button>
          </td>
        </tr>
      </table>
    </div>
  );
};

export default Absensi;
