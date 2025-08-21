import { Users } from "./users.model";

export const getAllUsers = async () => {
  return await Users.findAll();
};
