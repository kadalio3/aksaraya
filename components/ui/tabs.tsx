"use client";

import { useState, ReactNode } from "react";

interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    children: ReactNode[];
}

export function Tabs({ tabs, children }: TabsProps) {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return (
        <div>
            {/* Tab Headers */}
            <div className="border-b border-border">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-3 text-sm font-medium transition-[color,border-color] duration-300 relative ${activeTab === tab.id
                                ? "text-accent border-b-2 border-accent"
                                : "text-muted hover:text-fg"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {tab.icon && <span>{tab.icon}</span>}
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                                            ? "bg-accent/10 text-accent"
                                            : "bg-muted/10 text-muted"
                                            }`}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-6">
                {children.map((child, index) => (
                    <div
                        key={tabs[index].id}
                        className={activeTab === tabs[index].id ? "block" : "hidden"}
                    >
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
}
