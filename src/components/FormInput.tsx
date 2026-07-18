import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

function FormInput({ label, error, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

function FormTextarea({ label, error, ...props }: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        {...props}
        className={`input-field resize-none ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export { FormInput, FormTextarea }
