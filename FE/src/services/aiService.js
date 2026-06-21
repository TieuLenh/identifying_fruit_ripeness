import axios from "axios";

const API_URL = "http://localhost:5000";

const predictImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${API_URL}/predict`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("payload: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Predict image error:", error);

    throw (
      error.response?.data || {
        message: "Không thể kết nối tới server",
      }
    );
  }
};

const aiService = {
  predictImage,
};

export default aiService;