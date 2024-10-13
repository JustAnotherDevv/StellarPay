import axios from "axios";

export const uploadImageToInfura = async (imageFile: any) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const infuraProjectId = import.meta.env.VITE_PUBLIC_INFURA_ID;
  const infuraProjectSecret = import.meta.env.VITE_PUBLIC_INFURA_SECRET;

  console.log(infuraProjectId, `\n`, infuraProjectSecret);

  try {
    const response = await axios.post(
      "https://ipfs.infura.io:5001/api/v0/add",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization:
            "Basic " +
            Buffer.from(infuraProjectId + ":" + infuraProjectSecret).toString(
              "base64"
            ),
        },
      }
    );

    console.log("Upload successful:", response.data);
    return response.data.Hash;
  } catch (error) {
    console.error("Error uploading to Infura:", error);
    throw error;
  }
};
export function truncateStr(str: string, n = 6) {
  if (!str) return "";
  return str.length > n
    ? str.substr(0, n - 1) + "..." + str.substr(str.length - n, str.length - 1)
    : str;
}
