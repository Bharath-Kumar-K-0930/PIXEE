import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl border border-[#80deea] rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0a4f5c]">{title}</h3>
                    </div>
                </div>

                <p className="text-[#0a4f5c]/80 mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-[#0a4f5c] hover:bg-[#e0f7fa] rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg shadow-red-500/30 transition-all font-semibold"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
