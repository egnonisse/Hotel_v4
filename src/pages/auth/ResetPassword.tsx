import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Hotel, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;
type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: errorsReset, isSubmitting: isSubmittingReset } } = 
    useForm<ResetFormData>({
      resolver: zodResolver(resetSchema)
    });

  const { register: registerUpdate, handleSubmit: handleSubmitUpdate, formState: { errors: errorsUpdate, isSubmitting: isSubmittingUpdate } } = 
    useForm<UpdatePasswordFormData>({
      resolver: zodResolver(updatePasswordSchema)
    });

  const handleResetRequest = async (data: ResetFormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password?type=update`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions have been sent to your email');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset instructions. Please try again.');
    }
  };

  const handlePasswordUpdate = async (data: UpdatePasswordFormData) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      toast.success('Password has been updated successfully');
      navigate('/login');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Hotel className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {type === 'update' ? 'Update your password' : 'Reset your password'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {type === 'update' ? (
            <form onSubmit={handleSubmitUpdate(handlePasswordUpdate)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerUpdate('password')}
                    type="password"
                    className="input pl-10"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                {errorsUpdate.password && (
                  <p className="mt-1 text-sm text-red-600">{errorsUpdate.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerUpdate('confirmPassword')}
                    type="password"
                    className="input pl-10"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                {errorsUpdate.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errorsUpdate.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingUpdate}
                className="btn-primary w-full"
              >
                {isSubmittingUpdate ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitReset(handleResetRequest)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  {...registerReset('email')}
                  type="email"
                  className="input mt-1"
                  placeholder="you@example.com"
                />
                {errorsReset.email && (
                  <p className="mt-1 text-sm text-red-600">{errorsReset.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingReset}
                className="btn-primary w-full"
              >
                {isSubmittingReset ? 'Sending instructions...' : 'Send reset instructions'}
              </button>

              <div className="text-sm text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}