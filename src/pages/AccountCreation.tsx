
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import Button from '@/components/common/Button';
import { toast } from '@/hooks/use-toast';

const AccountCreation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'account' | 'profile'>('account');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    avatar: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'account') {
      // Basic validation
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        });
        return;
      }
      
      setStep('profile');
    } else {
      // Create account
      if (!formData.name || !formData.username) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      
      // In a real app, this would make an API call to create the account
      toast({
        title: "Account Created",
        description: "Welcome to Spot It!",
      });
      
      // Navigate to the main app
      navigate('/');
    }
  };
  
  const randomAvatarColors = [
    'bg-gradient-to-br from-spot-blue to-spot-purple',
    'bg-gradient-to-br from-spot-orange to-spot-pink',
    'bg-gradient-to-br from-spot-green to-spot-teal',
    'bg-gradient-to-br from-spot-indigo to-spot-blue',
    'bg-gradient-to-br from-spot-rose to-spot-pink',
  ];
  
  const generateRandomAvatar = () => {
    const randomColor = randomAvatarColors[Math.floor(Math.random() * randomAvatarColors.length)];
    setFormData(prev => ({ ...prev, avatar: randomColor }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-r from-spot-blue to-spot-purple rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <h1 className="font-bold text-2xl ml-2 bg-gradient-to-r from-spot-blue to-spot-purple bg-clip-text text-transparent">Spot It</h1>
        </div>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-1">
            {step === 'account' ? 'Create Your Account' : 'Complete Your Profile'}
          </h2>
          <p className="text-gray-600">
            {step === 'account' 
              ? 'Start leaving Spots for your friends!' 
              : 'Tell us a bit about yourself'}
          </p>
        </div>
        
        {/* Form */}
        <div className="glass-morphism rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleContinue}>
            {step === 'account' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div 
                    onClick={generateRandomAvatar}
                    className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer ${formData.avatar || randomAvatarColors[0]}`}
                  >
                    <span className="text-white text-2xl font-bold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                rightIcon={<ArrowRight size={18} />}
              >
                {step === 'account' ? 'Continue' : 'Create Account'}
              </Button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/')}
                className="text-primary font-medium hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreation;
