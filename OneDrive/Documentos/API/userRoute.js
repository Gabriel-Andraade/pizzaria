
import { register, login, getUser, deleteUser, updateUser } from "./userAController.js";

const routes = new Map([
  ["/register", register],
  ["/login", login],
  ["/user", getUser],
  ["/delete", deleteUser],
  ["/update", updateUser],
]);

export default routes;
