import { Request } from "express";

export const getHost = (req: Request) => {
  return `${req.protocol}://${req.get("host")}`;
};

export default getHost;
