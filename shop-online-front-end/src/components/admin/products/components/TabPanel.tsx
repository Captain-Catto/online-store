"use client";

import React, { memo } from "react";
import { useProductContext } from "../context/ProductContext";
// import { FormattedProduct } from "../types";

interface TabPanelProps {
  tabId: string;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = memo(({ tabId, children }) => {
  const { state } = useProductContext();
  const { activeTab } = state;

  return (
    <div
      className={`tab-pane ${activeTab === tabId ? "active" : ""}`}
      id={`${tabId}-tab`}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = "TabPanel";

export default TabPanel;
