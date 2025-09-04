import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { Calendar, DollarSign, Settings, Zap } from 'lucide-react';

const ICOSetupForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    tokenSymbol: '',
    totalTokensForSale: '',
    saleStartDate: '',
    saleEndDate: '',
    minContribution: '',
    maxContribution: '',
    softCap: '',
    hardCap: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Card className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
          <Zap className="text-purple-600" />
          <span>Create New ICO</span>
        </h2>
        <p className="text-gray-600 mt-2">Set up your token sale with automated smart contracts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. DeFi Protocol"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g. DFP"
                required
              />
            </div>
          </div>
        </div>

        {/* Token Economics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <DollarSign size={20} />
            <span>Token Economics</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Tokens for Sale
              </label>
              <input
                type="number"
                name="totalTokensForSale"
                value={formData.totalTokensForSale}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1000000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Contribution ($)
              </label>
              <input
                type="number"
                name="minContribution"
                value={formData.minContribution}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Contribution ($)
              </label>
              <input
                type="number"
                name="maxContribution"
                value={formData.maxContribution}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hard Cap ($)
              </label>
              <input
                type="number"
                name="hardCap"
                value={formData.hardCap}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="800000"
                required
              />
            </div>
          </div>
        </div>

        {/* Sale Timeline */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Sale Timeline</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Start Date
              </label>
              <input
                type="date"
                name="saleStartDate"
                value={formData.saleStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale End Date
              </label>
              <input
                type="date"
                name="saleEndDate"
                value={formData.saleEndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <Button type="submit" size="lg" className="flex-1">
            Create ICO Project
          </Button>
          <Button variant="outline" size="lg">
            Save as Draft
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ICOSetupForm;