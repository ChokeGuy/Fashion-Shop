import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 3, display: value === index ? "block" : "none" }}>
        <Box>{children}</Box>
      </Box>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export type TabType = {
  label: string;
  content: React.ReactNode;
};

export default function MyTabs({ chilren }: { chilren: TabType[] }) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className="w-full mt-8">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          className="pb-2 border-b border-border-color"
          TabIndicatorProps={{ style: { background: "white" } }}
          value={value}
          onChange={handleChange}
          aria-label="tabs"
          scrollButtons="auto"
        >
          {chilren.map((tab, index) => (
            <Tab
              key={index}
              wrapped
              className={`text-lg font-semibold text-left ${
                value === index ? "text-secondary-color" : "text-text-color"
              } transition-colors`} // Thay đổi màu của tab khi nó được chọn
              label={tab.label}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>
      {chilren.map((tab, index) => (
        <CustomTabPanel key={tab.label} value={value} index={index}>
          <article className="text-lg font-medium py-4">{tab.content}</article>
        </CustomTabPanel>
      ))}
    </Box>
  );
}
