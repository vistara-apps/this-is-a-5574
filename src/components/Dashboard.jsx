import React from 'react';
import StatsGrid from './StatsGrid';
import FundraisingChart from './FundraisingChart';
import InvestorTable from './InvestorTable';
import ProgressCircle from './ProgressCircle';
import Card from './Card';
import { TrendingUp, Target, Calendar } from 'lucide-react';

const Dashboard = ({ project }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Project Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold">{project.projectName}</h1>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                {project.status}
              </span>
            </div>
            <p className="text-white/80 text-lg">
              Token Symbol: <span className="font-semibold">{project.tokenSymbol}</span>
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Ends {new Date(project.saleEndDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target size={16} />
                <span>Hard Cap: ${project.hardCap.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <ProgressCircle progress={project.progress} size={100} />
            <div className="text-right">
              <div className="text-2xl font-bold">${project.totalRaised.toLocaleString()}</div>
              <div className="text-white/80">of ${project.hardCap.toLocaleString()} raised</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid project={project} />

      {/* Chart and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FundraisingChart />
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium">Export Investor Data</div>
                <div className="text-sm text-gray-600">Download CSV report</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium">Update Project Details</div>
                <div className="text-sm text-gray-600">Modify sale parameters</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium">Manage Refunds</div>
                <div className="text-sm text-gray-600">Process failed contributions</div>
              </button>
            </div>
          </Card>

          <Card variant="stats">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">7-Day Lock</span>
                <span className="font-semibold">45 investors</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">30-Day Lock</span>
                <span className="font-semibold">52 investors</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">90-Day Lock</span>
                <span className="font-semibold">30 investors</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Investor Table */}
      <InvestorTable />
    </div>
  );
};

export default Dashboard;