/* eslint-disable react/prop-types */
import { HomeLayout } from "./HomeLayout/HomeLayout";

const layoutMap = {
  home: HomeLayout,
};
console.log("first header");
export const DynamicLayout = ({ layout, children }) => {
  const Layout = layoutMap[layout] || HomeLayout; // Default to HomeLayout
  return <Layout>{children}</Layout>;
};
