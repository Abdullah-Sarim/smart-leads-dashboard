interface UserAvatarProps {
  email: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ email, size = 'md', className = '' }: UserAvatarProps) {
  const initial = email ? email.charAt(0).toUpperCase() : '?';
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div
      className={`rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
}