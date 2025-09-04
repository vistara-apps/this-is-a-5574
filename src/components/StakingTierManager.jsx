import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { Clock, TrendingUp, Lock, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import stakingService from '../services/stakingService.js';
import { usePaymentContext } from '../hooks/usePaymentContext.js';

const StakingTierManager = ({ projectId, onStakingUpdate }) => {
  const [stakingTiers, setStakingTiers] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStakeModal, setShowStakeModal] = useState(false);

  const { isConnected, address, balances } = usePaymentContext();

  useEffect(() => {
    loadStakingData();
  }, [address]);

  const loadStakingData = async () => {
    try {
      setIsLoading(true);
      
      // Load staking tiers
      const tiers = stakingService.getStakingTiers();
      setStakingTiers(tiers);

      // Load user data if connected
      if (isConnected && address) {
        const [positions, stats] = await Promise.all([
          stakingService.getUserStakingPositions(address),
          stakingService.getUserStakingStats(address)
        ]);
        
        setUserPositions(positions);
        setUserStats(stats);
      }

    } catch (error) {
      console.error('Failed to load staking data:', error);
      setError('Failed to load staking data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeTokens = async () => {
    if (!selectedTier || !stakeAmount || !isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate tier requirements
      const validation = stakingService.validateTierRequirement(selectedTier.id, stakeAmount);
      if (!validation.valid) {
        throw new Error(`Minimum investment for ${selectedTier.name} is ${validation.required} PUMP`);
      }

      // Mock wallet account (in real implementation, get from wallet context)
      const walletAccount = { address };

      const result = await stakingService.stakeTokens(stakeAmount, selectedTier.id, walletAccount);

      // Refresh data
      await loadStakingData();
      
      // Close modal and reset form
      setShowStakeModal(false);
      setSelectedTier(null);
      setStakeAmount('');

      // Notify parent component
      if (onStakingUpdate) {
        onStakingUpdate(result);
      }

    } catch (error) {
      console.error('Staking failed:', error);
      setError(error.message || 'Staking failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async (positionId) => {
    if (!isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      const walletAccount = { address };
      const result = await stakingService.claimStakingRewards(positionId, walletAccount);

      // Refresh data
      await loadStakingData();

      // Notify parent component
      if (onStakingUpdate) {
        onStakingUpdate(result);
      }

    } catch (error) {
      console.error('Claim failed:', error);
      setError(error.message || 'Claim failed');
    } finally {
      setIsLoading(false);
    }
  };

  const openStakeModal = (tier) => {
    setSelectedTier(tier);
    setShowStakeModal(true);
    setError(null);
  };

  const calculateRewardPreview = () => {
    if (!selectedTier || !stakeAmount) return null;
    
    try {
      return stakingService.calculateStakingRewards(stakeAmount, selectedTier.id);
    } catch (error) {
      return null;
    }
  };

  const rewardPreview = calculateRewardPreview();

  if (isLoading && stakingTiers.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading staking tiers...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* User Stats */}
      {userStats && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Staking Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stakingService.formatCurrency(userStats.totalStaked)}
              </div>
              <div className="text-sm text-gray-600">Total Staked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stakingService.formatCurrency(userStats.totalRewards)}
              </div>
              <div className="text-sm text-gray-600">Total Rewards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.activePositions}</div>
              <div className="text-sm text-gray-600">Active Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stakingService.formatCurrency(userStats.claimableRewards)}
              </div>
              <div className="text-sm text-gray-600">Claimable</div>
            </div>
          </div>
        </Card>
      )}

      {/* Staking Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stakingTiers.map((tier) => (
          <Card key={tier.id} className="relative">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">{tier.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{tier.description}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lock Duration</span>
                <span className="font-semibold flex items-center">
                  <Clock size={16} className="mr-1" />
                  {stakingService.formatStakingDuration(tier.lockDurationDays)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reward Rate</span>
                <span className="font-semibold text-green-600 flex items-center">
                  <TrendingUp size={16} className="mr-1" />
                  {stakingService.formatRewardPercentage(tier.rewardPercentage)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Minimum</span>
                <span className="font-semibold">
                  {stakingService.formatCurrency(tier.minimumInvestment)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => openStakeModal(tier)}
              disabled={!isConnected || isLoading}
              className="w-full"
            >
              {isConnected ? 'Stake Now' : 'Connect Wallet'}
            </Button>
          </Card>
        ))}
      </div>

      {/* User Positions */}
      {userPositions.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Staking Positions</h3>
          <div className="space-y-4">
            {userPositions.map((position) => (
              <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{position.tier.icon}</span>
                      <h4 className="font-semibold">{position.tier.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.isUnlocked 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {position.isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Staked: {stakingService.formatCurrency(position.stakedAmount)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      +{stakingService.formatCurrency(position.currentRewards)}
                    </div>
                    <div className="text-sm text-gray-600">Current Rewards</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>Progress: {position.daysStaked}/{position.tier.lockDurationDays} days</span>
                  {!position.isUnlocked && (
                    <span>{position.daysRemaining} days remaining</span>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (position.daysStaked / position.tier.lockDurationDays) * 100)}%` 
                    }}
                  ></div>
                </div>

                {position.canClaim && (
                  <Button
                    variant="primary"
                    onClick={() => handleClaimRewards(position.id)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Gift size={16} className="mr-2" />
                    Claim Rewards
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stake Modal */}
      {showStakeModal && selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Stake in {selectedTier.name}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Stake (PUMP)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder={`Minimum: ${selectedTier.minimumInvestment}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {rewardPreview && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Reward Preview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Principal:</span>
                      <span>{stakingService.formatCurrency(rewardPreview.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rewards:</span>
                      <span className="text-green-600">
                        +{stakingService.formatCurrency(rewardPreview.totalRewards)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>{stakingService.formatCurrency(rewardPreview.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStakeModal(false);
                  setSelectedTier(null);
                  setStakeAmount('');
                  setError(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStakeTokens}
                disabled={!stakeAmount || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Staking...' : 'Confirm Stake'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingTierManager;
