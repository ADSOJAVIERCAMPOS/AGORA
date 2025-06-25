import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onSignatureChange: (signature: string) => void;
    onSave?: (firma: any) => void;
}

export default function SignaturePad({ onSignatureChange, onSave }: SignaturePadProps) {
    const signatureRef = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const handleClear = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setIsEmpty(true);
            onSignatureChange('');
            if (onSave) onSave('');
        }
    };

    const handleEnd = () => {
        if (signatureRef.current) {
            const isEmpty = signatureRef.current.isEmpty();
            setIsEmpty(isEmpty);
            if (!isEmpty) {
                const signatureData = signatureRef.current.toDataURL();
                onSignatureChange(signatureData);
                if (onSave) onSave(signatureData);
            }
        }
    };

    return (
        <div className="w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                        className: 'w-full h-48 bg-white',
                    }}
                    onEnd={handleEnd}
                />
            </div>
            <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    {isEmpty ? 'Por favor, firme arriba' : 'Firma capturada'}
                </p>
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm text-red-600 hover:text-red-800"
                >
                    Limpiar firma
                </button>
            </div>
        </div>
    );
} 