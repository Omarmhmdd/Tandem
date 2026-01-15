import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface PasswordValidationChecklistProps {
  password: string;
  confirmPassword: string;
}

export const PasswordValidationChecklist: React.FC<PasswordValidationChecklistProps> = ({
  password,
  confirmPassword,
}) => {
  const checks = [
    {
      label: 'Contains at least one uppercase letter',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: 'Contains at least one special character',
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
    {
      label: 'Contains at least one number',
      isValid: /\d/.test(password),
    },
    {
      label: 'Passwords are matching',
      isValid: password.length > 0 && password === confirmPassword,
    },
  ];

  return (
    <div className="mt-2 space-y-1.5">
      {checks.map((check, index) => (
        <div key={index} className="flex items-center gap-2">
          {check.isValid ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#53389E] flex-shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" strokeWidth={2} />
          )}
          <span
            className={`text-xs ${
              check.isValid ? 'text-[#53389E]' : 'text-gray-500'
            }`}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
};

