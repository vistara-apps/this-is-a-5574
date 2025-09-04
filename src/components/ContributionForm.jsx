import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { DollarSign, Clock, Gift } from 'lucide-react';
import { stakingTiers } from '../data/mockData';

const ContributionForm = ({ project }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [selectedTier, setSelectedTier] = useState('7-day');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  
  const { createSession } = usePaymentContext();

  const handleContribute = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createSession(`$${amount}`);
      setPaid(true);
      // Show success message
      alert(`Successfully contributed $${amount} ${currency} to ${project.projectName}!`);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <Card variant="stats">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Contribution Successful!</h3>
          <p className="text-gray-600">
            Your contribution has been recorded and tokens will be distributed after the sale ends.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <DollarSign />
          <span>Contribute to {project.projectName}</span>
        </h3>
        <p className="text-gray-600 mt-1">Choose your contribution amount and staking tier</p>
      </div>

      <form onSubmit={handleContribute} className="space-y-6">
        {/* Contribution Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contribution Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="1000"
              min={project.minContribution}
              max={project.maxContribution}
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Min: ${project.minContribution} • Max: ${project.maxContribution}
          </p>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Currency
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCurrency('USDC')}
              className={`p-4 border-2 rounded-lg transition-all ${
                currency === 'USDC'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">USDC</div>
              <div className="text-sm text-gray-500">Stable coin</div>
            </button>
            <button
              type="button"
              onClick={() => setCurrency('SOL')}
              className={`p-4 border-2 rounded-lg transition-all ${
                currency === 'SOL'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">SOL</div>
              <div className="text-sm text-gray-500">Solana native</div>
            </button>
          </div>
        </div>

        {/* Staking Tiers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PUMP Staking Tier
          </label>
          <div className="space-y-3">
            {stakingTiers.map((tier) => (
              <button
                key={tier.tierId}
                type="button"
                onClick={() => setSelectedTier(tier.tierId)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  selectedTier === tier.tierId
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{tier.tierName}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{tier.lockDurationDays} days lock</span>
                      </span>
                      <span>{tier.rewardPercentage}% bonus</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Min investment</div>
                    <div className="font-medium">${tier.minimumInvestment}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full"
          disabled={loading || !amount || parseInt(amount) < project.minContribution}
        >
          {loading ? 'Processing Payment...' : `Contribute $${amount || '0'} ${currency}`}
        </Button>
      </form>
    </Card>
  );
};

export default ContributionForm;