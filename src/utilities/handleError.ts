import { AxiosError } from "axios";

function handleError(error: AxiosError) {
  if (error.response) {
    // The request was made and the server responded with a status code
    console.log("Error:", error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.log("Request:", error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error:", error.message);
  }
}

export { handleError };
