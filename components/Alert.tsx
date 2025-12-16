
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

interface AlertProps {
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    title?: string
    onClose?: () => void
}

export default function Alert({ type, message, title, onClose }: AlertProps) {
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-500',
            text: 'text-green-800',
            icon: <CheckCircle className="w-5 h-5 text-green-600" />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-500',
            text: 'text-red-900',
            icon: <XCircle className="w-5 h-5 text-red-600" />
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-500',
            text: 'text-yellow-800',
            icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-500',
            text: 'text-blue-800',
            icon: <Info className="w-5 h-5 text-blue-600" />
        }
    }

    const style = styles[type]

    return (
        <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded-r-lg shadow-sm mb-4 flex items-start justify-between`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5">{style.icon}</div>
                <div>
                    {title && <h3 className={`font-semibold ${style.text} mb-1`}>{title}</h3>}
                    <p className={`text-sm ${style.text} font-medium leading-relaxed`}>{message}</p>
                </div>
            </div>
            {onClose && (
                <button onClick={onClose} className={`text-gray-400 hover:text-gray-600 transition-colors`}>
                    <span className="sr-only">Close</span>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    )
}
