import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, User, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/common/Button';
import { signIn, signUp } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendWelcomeEmail = async (email: string, username: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: email,
          subject: "Welcome to Spot It!",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">Welcome to Spot It!</h1>
              </div>
              <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Hello ${username},</p>
                <p>Thank you for joining Spot It! We're excited to have you as part of our community.</p>
                <p>With Spot It, you can:</p>
                <ul>
                  <li>Leave messages in the real world</li>
                  <li>Connect with friends</li>
                  <li>Discover spots around you</li>
                </ul>
                <p>Get started by creating your first spot!</p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${window.location.origin}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Exploring</a>
                </div>
              </div>
            </div>
          `
        })
      });
      
      if (!response.ok) {
        console.error('Failed to send welcome email');
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in to Spot It",
        });
        
        // Redirect to main page
        navigate('/');
      } else {
        // Sign up
        const { data, error } = await signUp(email, password, username);
        
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Send welcome email
        await sendWelcomeEmail(email, username);

        toast({
          title: "Account created!",
          description: "Your Spot It account has been created successfully",
        });
        
        // Redirect to main page if auto-confirmation is enabled in Supabase
        if (data?.user) {
          navigate('/');
        } else {
          toast({
            title: "Email verification required",
            description: "Please check your email to confirm your account",
          });
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication error",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and brand */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-spot-blue to-spot-purple rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl mx-auto">
            S
          </div>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-spot-blue to-spot-purple bg-clip-text text-transparent">
            Spot It
          </h1>
          <p className="text-gray-600 mt-2">
            Leave messages in the real world
          </p>
        </div>

        {/* Auth form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                isLogin
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                !isLogin
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-sm text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              leftIcon={isLogin ? <LogIn size={18} /> : <ArrowRight size={18} />}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLogin ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          <div className="p-6 pt-0 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 font-medium"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
