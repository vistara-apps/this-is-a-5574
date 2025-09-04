// Mock data for development
export const mockICOProjects = [
  {
    projectId: '1',
    projectName: 'DeFi Token',
    tokenSymbol: 'DFT',
    totalTokensForSale: 1000000,
    saleStartDate: '2024-01-15',
    saleEndDate: '2024-03-15',
    minContribution: 100,
    maxContribution: 10000,
    escrowWalletAddress: '0x1234...5678',
    status: 'Active',
    totalRaised: 450000,
    softCap: 300000,
    hardCap: 800000,
    investors: 127,
    progress: 56.25
  },
  {
    projectId: '2',
    projectName: 'Gaming Coin',
    tokenSymbol: 'GAME',
    totalTokensForSale: 500000,
    saleStartDate: '2024-02-01',
    saleEndDate: '2024-04-01',
    minContribution: 50,
    maxContribution: 5000,
    escrowWalletAddress: '0x5678...9abc',
    status: 'Draft',
    totalRaised: 0,
    softCap: 150000,
    hardCap: 400000,
    investors: 0,
    progress: 0
  }
];

export const mockInvestors = [
  {
    investorId: '1',
    walletAddress: '0xabc123...def456',
    contributionAmount: 1500,
    contributionCurrency: 'USDC',
    contributionDate: '2024-01-20',
    tierId: '7-day',
    transactionHash: '0xtx123...abc',
    projectId: '1'
  },
  {
    investorId: '2',
    walletAddress: '0xdef456...ghi789',
    contributionAmount: 2800,
    contributionCurrency: 'SOL',
    contributionDate: '2024-01-22',
    tierId: '30-day',
    transactionHash: '0xtx456...def',
    projectId: '1'
  },
  {
    investorId: '3',
    walletAddress: '0xghi789...jkl012',
    contributionAmount: 5000,
    contributionCurrency: 'USDC',
    contributionDate: '2024-01-25',
    tierId: '90-day',
    transactionHash: '0xtx789...ghi',
    projectId: '1'
  }
];

export const stakingTiers = [
  {
    tierId: '7-day',
    tierName: '7-Day Lock',
    lockDurationDays: 7,
    rewardPercentage: 5,
    minimumInvestment: 100
  },
  {
    tierId: '30-day',
    tierName: '30-Day Lock',
    lockDurationDays: 30,
    rewardPercentage: 12,
    minimumInvestment: 500
  },
  {
    tierId: '90-day',
    tierName: '90-Day Lock',
    lockDurationDays: 90,
    rewardPercentage: 25,
    minimumInvestment: 1000
  }
];

export const chartData = [
  { name: 'Week 1', raised: 45000, target: 50000 },
  { name: 'Week 2', raised: 120000, target: 100000 },
  { name: 'Week 3', raised: 220000, target: 200000 },
  { name: 'Week 4', raised: 320000, target: 300000 },
  { name: 'Week 5', raised: 450000, target: 400000 },
];