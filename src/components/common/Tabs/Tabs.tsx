import React from "react";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <ul className="nav nav-tabs">
      {tabs.map((tab) => (
        <li key={tab.value} className="nav-item" onClick={() => onTabChange(tab.value)}>
          <a className={`nav-link ${tab.value === activeTab ? "active" : ""}`} href="#">
            {tab.label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default Tabs;
