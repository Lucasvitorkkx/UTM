'use client';

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

type OverviewProps = {
    data: {
        name: string;
        total: number;
    }[];
};

export function Overview({ data }: OverviewProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No data available for this period.
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RechartsBarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'transparent' }}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
