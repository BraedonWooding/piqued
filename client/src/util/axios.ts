import axios from "axios";

axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
  return Promise.reject(err);
});
