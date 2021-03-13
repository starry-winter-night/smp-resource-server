import fs from "fs";
import mime from "mime";
export const loadBase64ImageCode = (dir) => {
  const name = fs.readdirSync(dir);
  const path = `${dir}${name[0]}`;
  const imgMime = mime.getType(path);
  const baseData = fs.readFileSync(path, "base64");
  const data = { imgMime: imgMime, baseData: baseData };
  return data;
};
