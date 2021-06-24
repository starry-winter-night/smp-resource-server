import { loadBase64ImageCode } from "./photo.functions.js";
export const apiPhoto = () => {
  const dir = "src/public/image/";
  const imageResult = loadBase64ImageCode(dir);
  return imageResult;
};
