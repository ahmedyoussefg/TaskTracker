import axios from "axios";
import { toast } from "react-toastify";
import config from "./config";

const api = axios.create({
  baseURL: config.BASE_API_URL,
});

let logoutCallback = null;

export const injectLogoutHandler = (logoutFn) => {
  logoutCallback = logoutFn;
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      toast.error("Session expired. Logging out...");
      if (logoutCallback) logoutCallback();
    }
    return Promise.reject(err);
  }
);

export default api;
