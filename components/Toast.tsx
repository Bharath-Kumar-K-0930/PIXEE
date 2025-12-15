import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 3000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300 fade-in">
            <div className={`
                flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border
                ${type === 'success'
                    ? 'bg-[#e0f7fa]/90 border-[#158fa8] text-[#0a4f5c]'
                    : 'bg-red-50/90 border-red-200 text-red-800'
                }
            `}>
                {type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-[#158fa8]" />
                ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                )}

                <p className="font-medium text-sm">{message}</p>

                <button
                    onClick={onClose}
                    className="ml-2 hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
