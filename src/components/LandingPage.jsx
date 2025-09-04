import React, { useState } from 'react';
import Button from './Button';
import Card from './Card';
import ICOSetupForm from './ICOSetupForm';
import ContributionForm from './ContributionForm';
import { Zap, Shield, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { mockICOProjects } from '../data/mockData';

const LandingPage = ({ onCreateICO, onViewDashboard }) => {
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Smart Contract Automation',
      description: 'Secure, audited smart contracts with automated escrow and refund logic for SOL and USDC.'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Live fundraising dashboard with milestone tracking and investor tier visualization.'
    },
    {
      icon: Users,
      title: 'Tier Management',
      description: 'Automated PUMP staking tiers with 7, 30, and 90-day lock periods and rewards.'
    },
    {
      icon: Zap,
      title: 'Instant Deployment',
      description: 'Launch your ICO in minutes with one-click smart contract deployment to Base network.'
    }
  ];

  const plans = [
    {
      name: 'Basic',
      price: '$49',
      period: '/month',
      features: [
        'Up to 2 active ICOs',
        'Basic analytics dashboard',
        'Email support',
        'Standard smart contracts',
        '1% transaction fee'
      ]
    },
    {
      name: 'Pro',
      price: '$199',
      period: '/month',
      features: [
        'Unlimited ICOs',
        'Advanced analytics & reporting',
        'Priority support',
        'Custom branding',
        'White-label solution',
        '0.5% transaction fee'
      ],
      popular: true
    }
  ];

  if (showSetupForm) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button 
            onClick={() => setShowSetupForm(false)}
            className="text-white/80 hover:text-white flex items-center space-x-2"
          >
            <ArrowRight className="rotate-180" size={16} />
            <span>Back to Home</span>
          </button>
        </div>
        <ICOSetupForm onSubmit={onCreateICO} />
      </div>
    );
  }

  if (showContributionForm) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button 
            onClick={() => setShowContributionForm(false)}
            className="text-white/80 hover:text-white flex items-center space-x-2"
          >
            <ArrowRight className="rotate-180" size={16} />
            <span>Back to Home</span>
          </button>
        </div>
        <div className="max-w-md mx-auto">
          <ContributionForm project={mockICOProjects[0]} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
          Launch your ICO.<br />
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Securely. Simply.
          </span><br />
          With PUMP.
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
          Create and manage token sales with automated escrow, tiered investor management, 
          and real-time fundraising visualization. Built for Solana and USDC.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => setShowSetupForm(true)}
            className="text-lg px-8 py-4"
          >
            <Zap className="mr-2" size={20} />
            Launch ICO Now
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowContributionForm(true)}
            className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
          >
            View Demo ICO
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything you need for a successful ICO
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            From smart contract deployment to investor management, we handle the technical complexity 
            so you can focus on building your project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center h-full">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Active ICOs Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Live ICO Projects</h2>
          <p className="text-white/80 text-lg">Discover and contribute to active fundraising campaigns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockICOProjects.map((project) => (
            <Card key={project.projectId} className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{project.projectName}</h3>
                  <p className="text-gray-600">{project.tokenSymbol}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    ${project.totalRaised.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{project.investors}</div>
                  <div className="text-sm text-gray-600">Investors</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.ceil((new Date(project.saleEndDate) - new Date()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Left</div>
                </div>
              </div>

              <div className="flex space-x-3">
                {project.status === 'Active' && (
                  <Button 
                    className="flex-1"
                    onClick={() => setShowContributionForm(true)}
                  >
                    Contribute Now
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onViewDashboard(project)}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-white/80 text-lg">Choose the plan that fits your fundraising needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`p-8 ${plan.popular ? 'ring-2 ring-purple-500 relative' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;