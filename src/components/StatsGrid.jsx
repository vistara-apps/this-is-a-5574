import React from 'react';
import Card from './Card';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

const StatsGrid = ({ project }) => {
  const stats = [
    {
      label: 'Total Raised',
      value: `$${project.totalRaised.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Investors',
      value: project.investors,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Progress',
      value: `${project.progress}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      label: 'Days Left',
      value: Math.ceil((new Date(project.saleEndDate) - new Date()) / (1000 * 60 * 60 * 24)),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} variant="stats">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;