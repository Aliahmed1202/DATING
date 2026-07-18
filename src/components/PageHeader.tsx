import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  showMobileOnly?: boolean
}

function PageHeader({ title, subtitle, action, showMobileOnly = false }: PageHeaderProps) {
  return (
    <div className={`${showMobileOnly ? 'md:hidden' : ''} bg-white shadow-sm pt-4`}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

export default PageHeader
