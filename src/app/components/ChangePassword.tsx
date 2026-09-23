import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChangePasswordProps {
  onPasswordChanged: () => void;
  userEmail: string;
}

export default function ChangePassword({ onPasswordChanged, userEmail }: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    old_password?: string;
    new_password?: string;
    confirm_password?: string;
  }>({});

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];

    if (password.length < 8) {
      issues.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      issues.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      issues.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      issues.push('One number');
    }

    return issues;
  };

  const passwordIssues = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!oldPassword) {
      setErrors({ old_password: 'Current password is required' });
      return;
    }

    if (passwordIssues.length > 0) {
      setErrors({ new_password: 'Password does not meet requirements' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirm_password: 'Passwords do not match' });
      return;
    }

    if (oldPassword === newPassword) {
      setErrors({ new_password: 'New password must be different from current password' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/users/change_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully!');
        setTimeout(() => {
          onPasswordChanged();
        }, 1000);
      } else {
        // Handle backend errors
        if (data.old_password) {
          setErrors({ old_password: data.old_password });
          toast.error(data.old_password);
        } else if (data.new_password) {
          setErrors({ new_password: data.new_password });
          toast.error(data.new_password);
        } else if (data.confirm_password) {
          setErrors({ confirm_password: data.confirm_password });
          toast.error(data.confirm_password);
        } else {
          toast.error('Failed to change password');
        }
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password Required</h1>
          <p className="text-gray-600 mt-2">
            Please change your temporary password to continue
          </p>
          <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border ${
                  errors.old_password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.old_password && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.old_password}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border ${
                  errors.new_password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                {[
                  { label: 'At least 8 characters', check: newPassword.length >= 8 },
                  { label: 'One uppercase letter', check: /[A-Z]/.test(newPassword) },
                  { label: 'One lowercase letter', check: /[a-z]/.test(newPassword) },
                  { label: 'One number', check: /[0-9]/.test(newPassword) },
                ].map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {req.check ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={req.check ? 'text-green-600' : 'text-gray-600'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.new_password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border ${
                  errors.confirm_password ? 'border-red-500' :
                  confirmPassword && !passwordsMatch ? 'border-red-500' :
                  passwordsMatch ? 'border-green-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Re-enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Passwords do not match
              </p>
            )}

            {passwordsMatch && (
              <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || passwordIssues.length > 0 || !passwordsMatch || !oldPassword}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Change Password
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Security Tip:</strong> Choose a strong password that you don't use for other accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
