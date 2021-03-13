import { loadBase64ImageCode } from "./photo.functions";
export const apiPhoto = () => {
  const dir = "src/public/image/";
  const imageResult = loadBase64ImageCode(dir);
  return imageResult;
};
