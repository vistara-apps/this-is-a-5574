import React from 'react';
import Card from './Card';
import { ExternalLink, Copy } from 'lucide-react';
import { mockInvestors } from '../data/mockData';

const InvestorTable = () => {
  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Investors</h3>
        <p className="text-gray-600">Latest contributions and tier breakdown</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Wallet</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Currency</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Tier</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockInvestors.map((investor) => (
              <tr key={investor.investorId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{truncateAddress(investor.walletAddress)}</span>
                    <button 
                      onClick={() => copyToClipboard(investor.walletAddress)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold">${investor.contributionAmount.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investor.contributionCurrency === 'USDC' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {investor.contributionCurrency}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {investor.tierId}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(investor.contributionDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <button className="text-purple-600 hover:text-purple-800">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default InvestorTable;