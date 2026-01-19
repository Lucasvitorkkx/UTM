import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register - TrackFlux',
    description: 'Create an account',
};

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <RegisterForm />
        </div>
    );
}
